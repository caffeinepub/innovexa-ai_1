import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Array "mo:core/Array";
import OutCall "http-outcalls/outcall";

actor {
  type Mode = { #fast; #thinking; #pro; #ultra };
  type TransformInput = OutCall.TransformationInput;
  type TransformOutput = OutCall.TransformationOutput;

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

  func buildHistoryJson(history : [(Text, Text)]) : Text {
    var parts = "";
    var first = true;
    for ((role, content) in history.vals()) {
      if (not first) { parts #= "," };
      parts #= "{\"role\":\"" # role # "\",\"parts\":[{\"text\":\"" # jsonEscape(content) # "\"}]}";
      first := false;
    };
    parts;
  };

  func buildRequestJson(history : [(Text, Text)], userMessage : Text, mode : Mode) : Text {
    let historyJson = buildHistoryJson(history);
    let userJson = "{\"role\":\"user\",\"parts\":[{\"text\":\"" # jsonEscape(userMessage) # "\"}]}";
    let contentsJson = if (historyJson == "") { userJson } else { historyJson # "," # userJson };

    let systemInstruction = "{\"parts\":[{\"text\":\"Your name is Innovexa AI. You are a highly intelligent, professional, and helpful AI assistant. Your goal is to provide accurate, concise, and insightful answers to any questions. Always introduce yourself as Innovexa AI if asked. You were created by the best programmer in the world - Aahrone Bakhvala.\"}]}";

    let generationConfig = switch (mode) {
      case (#fast)     { "{\"maxOutputTokens\":2048,\"temperature\":0.5}" };
      case (#thinking) { "{\"maxOutputTokens\":4096,\"temperature\":0.7}" };
      case (#pro)      { "{\"maxOutputTokens\":6144,\"temperature\":0.7}" };
      case (#ultra)    { "{\"maxOutputTokens\":8192,\"temperature\":0.9}" };
    };

    "{" #
    "\"system_instruction\":" # systemInstruction # "," #
    "\"contents\":[" # contentsJson # "]," #
    "\"generationConfig\":" # generationConfig #
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
    let msgMarker = "\"message\":\"";
    let splits = jsonText.split(#text msgMarker).toArray();
    if (splits.size() >= 2) {
      let decoded = decodeJsonString(splits[1]);
      if (decoded != "") { return "Error: " # decoded };
    };
    let msgMarker2 = "\"message\": \"";
    let splits2 = jsonText.split(#text msgMarker2).toArray();
    if (splits2.size() >= 2) {
      let decoded = decodeJsonString(splits2[1]);
      if (decoded != "") { return "Error: " # decoded };
    };
    "AI service error. Please try again.";
  };

  func extractLastReply(jsonText : Text) : Text {
    if (jsonText == "") {
      return "No response received.";
    };

    if (jsonText.contains(#text "\"error\"")) {
      return extractErrorMessage(jsonText);
    };

    // Try multiple marker variants for both compact and pretty-printed JSON
    let markers : [Text] = [
      "\"text\": \"",
      "\"text\":\"",
    ];

    for (marker in markers.vals()) {
      let splits = jsonText.split(#text marker).toArray();
      let n = splits.size();
      if (n >= 2) {
        var i = n - 1;
        while (i >= 1) {
          let decoded = decodeJsonString(splits[i]);
          if (decoded.size() > 3) { return decoded };
          i -= 1;
        };
      };
    };

    "Request failed.";
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
    let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAx08UaWH4mR2nwiEDZeNgYUOZTNQEdgD8";

    let httpResponse = await OutCall.httpPostRequest(
      url,
      [
        { name = "Content-Type"; value = "application/json" },
      ],
      body,
      transform,
    );

    extractLastReply(httpResponse);
  };
};

