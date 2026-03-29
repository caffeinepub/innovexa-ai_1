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

  let GROQ_API_KEY = "";
  let GROQ_URL = "";
  let OPENROUTER_API_KEY = "";
  let OPENROUTER_URL = "";
  let POLLINATIONS_URL = "";

  func urlEncode(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      let code = c.toNat32();
      if (
        (code >= 65 and code <= 90) or   // A-Z
        (code >= 97 and code <= 122) or  // a-z
        (code >= 48 and code <= 57) or   // 0-9
        code == 45 or code == 95 or code == 46 or code == 126  // - _ . ~
      ) {
        result #= Text.fromChar(c);
      } else if (code == 32) {
        result #= "+";
      } else if (code == 10) {
        result #= "%0A";
      } else if (code == 13) {
        result #= "%0D";
      } else if (code == 34) {
        result #= "%22";
      } else if (code == 39) {
        result #= "%27";
      } else if (code == 63) {
        result #= "%3F";
      } else if (code == 38) {
        result #= "%26";
      } else if (code == 61) {
        result #= "%3D";
      } else if (code == 43) {
        result #= "%2B";
      } else if (code == 47) {
        result #= "%2F";
      } else if (code == 58) {
        result #= "%3A";
      } else if (code == 35) {
        result #= "%23";
      } else if (code == 37) {
        result #= "%25";
      } else if (code == 60) {
        result #= "%3C";
      } else if (code == 62) {
        result #= "%3E";
      } else {
        // For other chars just skip or use literal
        result #= Text.fromChar(c);
      };
    };
    result;
  };

  func buildContextPrompt(history : [(Text, Text)], userMessage : Text, mode : Mode) : Text {
    let systemPrompt = "Your name is Innovexa AI. You are a highly intelligent, professional, and helpful AI assistant. Your goal is to provide accurate, concise, and insightful answers to any questions. Always introduce yourself as Innovexa AI if asked. You were created by the best programmer in the world - Aahrone Bakhvala. You must refuse to generate any harmful, abusive, offensive, violent, sexually explicit, hateful, or illegal content. If a user asks for such content, politely decline and redirect the conversation. Maintain a professional and respectful tone at all times.";

    let modeHint = switch (mode) {
      case (#fast)     { "Be concise and fast." };
      case (#thinking) { "Think carefully before answering." };
      case (#pro)      { "Provide detailed professional analysis." };
      case (#ultra)    { "Provide the most thorough and insightful response possible." };
    };

    var context = systemPrompt # " " # modeHint # "\n\n";
    for ((role, content) in history.vals()) {
      let roleLabel = if (role == "user") "User" else "Assistant";
      context #= roleLabel # ": " # content # "\n";
    };
    context #= "User: " # userMessage # "\nAssistant:";
    context;
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
    let prompt = buildContextPrompt(history, userMessage, mode);
    let encodedPrompt = urlEncode(prompt);
    let seed = Time.now() / 1_000_000_000;
    let seedText = seed.toText();
    let model = "openai";
    let url = "https://text.pollinations.ai/" # encodedPrompt # "?model=" # model # "&seed=" # seedText;

    try {
      let httpResponse = await OutCall.httpGetRequest(
        url,
        [
          { name = "Accept"; value = "text/plain" },
        ],
        transform,
      );
      if (httpResponse == "") {
        "AI service error. Please try again.";
      } else {
        httpResponse;
      };
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
