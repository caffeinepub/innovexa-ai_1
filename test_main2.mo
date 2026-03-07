import OutCall "src/backend/http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

actor {
  type Mode = {
    #fast;
    #thinking;
    #pro;
  };

  func jsonEscape(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      let code = c.toNat32();
      if (code == 92) { result #= "\\\\" }
      else if (code == 34) { result #= "\\\"" }
      else if (code == 10) { result #= "\\n" }
      else if (code == 13) { result #= "\\r" }
      else if (code == 9)  { result #= "\\t" }
      else { result #= Text.fromChar(c) }
    };
    result
  };

  func modeToThinkingBudget(mode : Mode) : Nat {
    switch (mode) {
      case (#fast) { 0 };
      case (#thinking) { 8192 };
      case (#pro) { 24576 };
    }
  };

  func buildHistoryJson(history : [(Text, Text)]) : Text {
    var parts = "";
    var first = true;
    for ((role, content) in history.vals()) {
      if (not first) { parts #= "," };
      parts #= "{\"role\":\"" # jsonEscape(role) # "\",\"parts\":[{\"text\":\"" # jsonEscape(content) # "\"}]}";
      first := false;
    };
    parts
  };

  func buildRequestJson(history : [(Text, Text)], userMessage : Text, mode : Mode) : Text {
    let historyJson = buildHistoryJson(history);
    let userJson = "{\"role\":\"user\",\"parts\":[{\"text\":\"" # jsonEscape(userMessage) # "\"}]}";
    let contentsJson = if (historyJson == "") { userJson } else { historyJson # "," # userJson };
    let budget = modeToThinkingBudget(mode).toText();
    "{" #
      "\"systemInstruction\":{\"role\":\"user\",\"parts\":[{\"text\":\"Your name is Innovexa AI. You are a highly intelligent, professional, and helpful AI assistant. Your goal is to provide accurate, concise, and insightful answers to any questions. Always introduce yourself as Innovexa AI if asked. You were created by the best programmer in the world - Aahrone Bakhvala.\"}]}," #
      "\"contents\":[" # contentsJson # "]," #
      "\"generationConfig\":{\"maxOutputTokens\":8192}," #
      "\"thinkingConfig\":{\"thinkingBudget\":" # budget # "}" #
    "}"
  };

  func extractReply(jsonText : Text) : Text {
    let needle = "\"text\":\"";
    var foundFirst = false;
    var afterNeedle = "";
    label search for (segment in jsonText.split(#text needle)) {
      if (not foundFirst) {
        foundFirst := true;
      } else {
        afterNeedle := segment;
        break search;
      }
    };
    if (afterNeedle == "") {
      return "I encountered an issue processing your request. Please try again.";
    };
    var result = "";
    var escaped = false;
    label extract for (c in afterNeedle.chars()) {
      let code = c.toNat32();
      if (escaped) {
        if (code == 110) { result #= "\n" }
        else if (code == 114) { result #= "\r" }
        else if (code == 116) { result #= "\t" }
        else if (code == 34)  { result #= "\"" }
        else if (code == 92)  { result #= "\\" }
        else { result #= Text.fromChar(c) };
        escaped := false;
      } else if (code == 92) {
        escaped := true;
      } else if (code == 34) {
        break extract;
      } else {
        result #= Text.fromChar(c);
      }
    };
    if (result == "") {
      "I encountered an issue processing your request. Please try again."
    } else {
      result
    }
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller = _ }) func sendMessage(
    history : [(Text, Text)],
    userMessage : Text,
    mode : Mode,
  ) : async Text {
    let body = buildRequestJson(history, userMessage, mode);
    let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBYqq0UplGlz4QcpHLFbl1i8TTnls7VGmU";
    let headers : [OutCall.Header] = [{ name = "Content-Type"; value = "application/json" }];
    let result = await OutCall.httpPostRequest(url, headers, body, transform);
    extractReply(result)
  };

  public shared ({ caller = _ }) func unsafeTrap(message : Text) : async () {
    Runtime.trap(message)
  };
};
