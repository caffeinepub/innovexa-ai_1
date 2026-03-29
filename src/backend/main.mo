import Text "mo:core/Text";
import Map "mo:core/Map";
import OutCall "http-outcalls/outcall";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Array "mo:core/Array";

actor {
  type Mode = { #fast; #thinking; #pro; #ultra };
  type TransformInput = OutCall.TransformationInput;
  type TransformOutput = OutCall.TransformationOutput;

  type Conversation = {
    id : Text;
    title : Text;
    messages : Text;
    mode : Text;
    timestamp : Int;
  };

  type Account = {
    passwordHash : Text;
    conversations : [Conversation];
  };

  let accounts = Map.empty<Text, Account>();

  // Kept for stable variable compatibility with previous version
  let GROQ_API_KEY = "";
  let GROQ_URL = "";

  let OPENROUTER_API_KEY = "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";
  let OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

  func jsonEscape(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      let code = c.toNat32();
      if (code == 92) { result #= "\\\\" }
      else if (code == 34) { result #= "\\\"" }
      else if (code == 10) { result #= "\\n" }
      else if (code == 13) { result #= "\\r" }
      else if (code == 9)  { result #= "\\t" }
      else { result #= Text.fromChar(c) };
    };
    result;
  };

  func buildRequestJson(history : [(Text, Text)], userMessage : Text, mode : Mode) : Text {
    let systemMsg = "{\"role\":\"system\",\"content\":\"Your name is Innovexa AI. You are a highly intelligent, professional, and helpful AI assistant. Your goal is to provide accurate, concise, and insightful answers to any questions. Always introduce yourself as Innovexa AI if asked. You were created by the best programmer in the world - Aahrone Bakhvala. You must refuse to generate any harmful, abusive, offensive, violent, sexually explicit, hateful, or illegal content. If a user asks for such content, politely decline and redirect the conversation. Maintain a professional and respectful tone at all times.\"}";

    var messages = systemMsg;
    for ((role, content) in history.vals()) {
      let msgRole = if (role == "user") "user" else "assistant";
      messages #= ",{\"role\":\"" # msgRole # "\",\"content\":\"" # jsonEscape(content) # "\"}";
    };
    messages #= ",{\"role\":\"user\",\"content\":\"" # jsonEscape(userMessage) # "\"}";

    let (model, maxTokens, temperature) = switch (mode) {
      case (#fast)     { ("meta-llama/llama-3.3-70b-instruct:free", "2048", "0.5") };
      case (#thinking) { ("meta-llama/llama-3.3-70b-instruct:free", "4096", "0.7") };
      case (#pro)      { ("meta-llama/llama-3.3-70b-instruct:free", "6144", "0.7") };
      case (#ultra)    { ("meta-llama/llama-3.3-70b-instruct:free", "8192", "0.9") };
    };

    "{" #
    "\"model\":\"" # model # "\"," #
    "\"messages\":[" # messages # "]," #
    "\"max_tokens\":" # maxTokens # "," #
    "\"temperature\":" # temperature #
    "}";
  };

  func decodeJsonString(segment : Text) : Text {
    var result = "";
    var escaped = false;
    let iter = segment.chars();
    label decode for (c in iter) {
      let code = c.toNat32();
      if (escaped) {
        switch (code) {
          case (110) { result #= "\n" };
          case (114) { result #= "\r" };
          case (116) { result #= "\t" };
          case (34)  { result #= "\"" };
          case (92)  { result #= "\\" };
          case (_)   { result #= Text.fromChar(c) };
        };
        escaped := false;
      } else if (code == 34) {
        break decode;
      } else if (code == 92) {
        escaped := true;
      } else {
        result #= Text.fromChar(c);
      };
    };
    result;
  };

  func extractErrorMessage(jsonText : Text) : Text {
    let msgMarkers : [Text] = [
      "\"message\": \"",
      "\"message\":\"",
    ];
    for (marker in msgMarkers.vals()) {
      let splits = jsonText.split(#text marker).toArray();
      if (splits.size() >= 2) {
        let msg = decodeJsonString(splits[1]);
        if (msg.size() > 0) { return msg };
      };
    };
    "AI service error. Please try again.";
  };

  func extractReply(jsonText : Text) : Text {
    if (jsonText == "") {
      return "AI service error. Please try again.";
    };

    let markers : [Text] = [
      "\"content\": \"",
      "\"content\":\"",
    ];

    for (marker in markers.vals()) {
      let splits = jsonText.split(#text marker).toArray();
      let n = splits.size();
      if (n >= 2) {
        let decoded = decodeJsonString(splits[1]);
        if (decoded.size() > 0) { return decoded };
      };
    };

    if (jsonText.contains(#text "\"error\"")) {
      return extractErrorMessage(jsonText);
    };

    "AI service error. Please try again.";
  };

  func validateCredentials(username : Text, password : Text) : ?Account {
    switch (accounts.get(username)) {
      case (null) { null };
      case (?account) {
        if (account.passwordHash != password) {
          null;
        } else {
          ?account;
        };
      };
    };
  };

  public query func transform(input : TransformInput) : async TransformOutput {
    OutCall.transform(input);
  };

  public shared ({ caller = _ }) func sendMessage(
    history : [(Text, Text)],
    userMessage : Text,
    mode : Mode,
  ) : async Text {
    let body = buildRequestJson(history, userMessage, mode);

    try {
      let httpResponse = await OutCall.httpPostRequest(
        OPENROUTER_URL,
        [
          { name = "Content-Type"; value = "application/json" },
          { name = "Authorization"; value = "Bearer " # OPENROUTER_API_KEY },
          { name = "HTTP-Referer"; value = "https://innovexa.ai" },
          { name = "X-Title"; value = "Innovexa AI" },
        ],
        body,
        transform,
      );
      extractReply(httpResponse);
    } catch (_) {
      "AI service error. Please try again.";
    };
  };

  public shared ({ caller = _ }) func createAccount(username : Text, password : Text) : async Bool {
    if (accounts.containsKey(username)) { false } else {
      let account : Account = {
        passwordHash = password;
        conversations = [];
      };
      accounts.add(username, account);
      true;
    };
  };

  public query ({ caller = _ }) func getConversations(username : Text, password : Text) : async [Conversation] {
    switch (validateCredentials(username, password)) {
      case (null) { [] };
      case (?account) { account.conversations };
    };
  };

  public shared ({ caller = _ }) func saveConversation(
    username : Text,
    password : Text,
    conversation : Conversation,
  ) : async Bool {
    switch (validateCredentials(username, password)) {
      case (null) { false };
      case (?account) {
        let existing = account.conversations.find(func(conv) { conv.id == conversation.id });
        var newConvs = account.conversations;
        switch (existing) {
          case (?found) {
            newConvs := newConvs.map(func(conv) { if (conv.id == conversation.id) { conversation } else { conv } });
          };
          case (null) {
            newConvs := newConvs.concat([conversation]);
          };
        };

        let newAccount : Account = {
          passwordHash = account.passwordHash;
          conversations = newConvs;
        };
        accounts.add(username, newAccount);
        true;
      };
    };
  };

  public shared ({ caller = _ }) func deleteConversation(username : Text, password : Text, conversationId : Text) : async Bool {
    switch (validateCredentials(username, password)) {
      case (null) { false };
      case (?account) {
        let filtered = account.conversations.filter(
          func(conv) { conv.id != conversationId }
        );
        let newAccount : Account = {
          passwordHash = account.passwordHash;
          conversations = filtered;
        };
        accounts.add(username, newAccount);
        true;
      };
    };
  };

  public shared ({ caller = _ }) func loginAccount(username : Text, password : Text) : async [Conversation] {
    switch (validateCredentials(username, password)) {
      case (null) { [] };
      case (?account) { account.conversations };
    };
  };
};
