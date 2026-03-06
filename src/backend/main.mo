import OutCall "http-outcalls/outcall";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Array "mo:core/Array";

actor {
  type Mode = {
    #fast;
    #thinking;
    #pro;
  };

  type ThinkingConfig = {
    thinkingBudget : Nat;
  };

  type GeminiRequest = {
    systemInstruction : {
      parts : [{
        text : Text;
      }];
      role : Text;
    };
    contents : [{ role : Text; parts : [{ text : Text }] }];
    generationConfig : {
      stopSequences : [{}];
      stopReasonCriteria : [Text];
      stopSensitivity : {
        epsilon : Blob;
      };
      maxOutputTokens : Nat;
      temperature : Nat;
      topP : Nat;
      topK : Nat;
      topASize : Nat;
      typicalPRate : Nat;
      presencePenalty : Nat;
      frequencyPenalty : Nat;
      countPenalty : Nat;
      confidencePenalty : Nat;
      calibrationFlags : {
        stopSequences : Bool;
        stopSensitivity : Bool;
        confidencePenalty : Bool;
        typicalPRate : Bool;
        countPenalty : Bool;
        presencePenalty : Bool;
        frequencyPenalty : Bool;
        temperature : Bool;
        topP : Bool;
        topK : Bool;
      };
      repetitionPenalty : {
        penalizeSpecialTokens : Bool;
        penalizeDigits : Bool;
        penaltyRate : Nat;
        stopSequences : [Text];
        stopReasonCriteria : [Text];
        cardinalityPenalty : {
          maxCardinality : Nat;
          penaltyRate : Nat;
        };
      };
      formalRepetitionPenalty : {
        repetitionPenalty : {
          penalizeSpecialTokens : Bool;
          penalizeDigits : Bool;
          penaltyRate : Nat;
          stopSequences : [Text];
          stopReasonCriteria : [Text];
          cardinalityPenalty : {
            maxCardinality : Nat;
            penaltyRate : Nat;
          };
        };
        calibrationFlags : {
          stopSequences : Bool;
          stopSensitivity : Bool;
          temperature : Bool;
        };
      };
      temperaturePenalty : Nat;
      formalTemperaturePenalty : { temperature : Nat };
      normalizationPenalty : {
        maxUppercaseRatio : Nat;
        penaltyRate : Nat;
        exceptionCharacterInfo : {
          character : Text;
          countType : {
            allUppercase : {};
            capitalized : {};
          };
        };
      };
      tokenLimitFraction : {
        limitFraction : Nat;
        penaltyRate : Nat;
        exceptionFraction : Nat;
        minTokenLimit : Nat;
      };
      stopTokenCardinalStopTokens : {
        tokenId : Nat;
        maxCardinality : Nat;
      };
    };
    thinkingConfig : ThinkingConfig;
  };

  func modeToThinkingBudget(mode : Mode) : Nat {
    switch (mode) {
      case (#fast) { 0 };
      case (#thinking) { 8192 };
      case (#pro) { 24576 };
    };
  };

  func buildGeminiRequest(history : [(Text, Text)], userMessage : Text, mode : Mode) : GeminiRequest {
    let historyList = List.empty<{ role : Text; parts : [{ text : Text }] }>();
    for ((role, content) in history.values()) {
      historyList.add({
        role;
        parts = [{ text = content }];
      });
    };

    let userMessageContent = {
      role = "user";
      parts = [{ text = userMessage }];
    };

    let contentsArray = historyList.toArray().concat([userMessageContent]);

    {
      systemInstruction = {
        parts = [{
          text = "Your name is Innovexa AI. You are a highly intelligent, professional, and helpful AI assistant. Your goal is to provide accurate, concise, and insightful answers to any questions. Always introduce yourself as Innovexa AI if asked. You were created by the best programmer in the world - Aahrone Bakhvala.";
        }];
        role = "system";
      };
      contents = contentsArray;
      generationConfig = {
        stopSequences = [];
        stopReasonCriteria = ["STOP_REASON_ENDTURN"];
        stopSensitivity = { epsilon = Blob.fromArray([0]) };
        maxOutputTokens = 8192;
        temperature = 1;
        topP = 1;
        topK = 0;
        topASize = 0;
        typicalPRate = 1;
        presencePenalty = 0;
        frequencyPenalty = 0;
        countPenalty = 0;
        confidencePenalty = 0;
        calibrationFlags = {
          stopSequences = true;
          stopSensitivity = true;
          confidencePenalty = true;
          typicalPRate = true;
          countPenalty = true;
          presencePenalty = true;
          frequencyPenalty = true;
          temperature = true;
          topP = true;
          topK = true;
        };
        repetitionPenalty = {
          penalizeSpecialTokens = false;
          penalizeDigits = true;
          penaltyRate = 0;
          stopSequences = [];
          stopReasonCriteria = [];
          cardinalityPenalty = {
            maxCardinality = 0;
            penaltyRate = 1;
          };
        };
        formalRepetitionPenalty = {
          repetitionPenalty = {
            penalizeSpecialTokens = false;
            penalizeDigits = true;
            penaltyRate = 0;
            stopSequences = [];
            stopReasonCriteria = [];
            cardinalityPenalty = {
              maxCardinality = 0;
              penaltyRate = 1;
            };
          };
          calibrationFlags = {
            stopSequences = true;
            stopSensitivity = true;
            temperature = true;
          };
        };
        temperaturePenalty = 0;
        formalTemperaturePenalty = { temperature = 1 };
        normalizationPenalty = {
          maxUppercaseRatio = 0;
          penaltyRate = 1;
          exceptionCharacterInfo = {
            character = "";
            countType = {
              capitalized = {};
              allUppercase = {};
            };
          };
        };
        tokenLimitFraction = {
          limitFraction = 0;
          penaltyRate = 1;
          exceptionFraction = 2;
          minTokenLimit = 1;
        };
        stopTokenCardinalStopTokens = { tokenId = 14; maxCardinality = 2 };
      };
      thinkingConfig = { thinkingBudget = modeToThinkingBudget(mode) };
    };
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // SAFETY: JSON is not parsed, returned as raw text, to be parsed in frontend for now.
  // JSON parsing capabilities will be added to Motoko in 2024.
  func extractReply(jsonText : Text) : Text {
    jsonText;
  };

  public shared ({ caller }) func sendMessage(
    history : [(Text, Text)],
    userMessage : Text,
    mode : Mode,
  ) : async Text {
    let geminiRequest = buildGeminiRequest(history, userMessage, mode);

    let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBYqq0UplGlz4QcpHLFbl1i8TTnls7VGmU";
    let headers : [OutCall.Header] = [{ name = "Content-Type"; value = "application/json" }];

    let result = await OutCall.httpPostRequest(url, headers, "{request}", transform); // "{request}" will be fixed in the next version once we enable serializing Motoko values to JSON.

    let reply = extractReply(result);
    reply;
  };

  public shared ({ caller }) func unsafeTrap(message : Text) : async () { Runtime.trap(message) };
};
