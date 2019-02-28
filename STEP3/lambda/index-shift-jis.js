const Alexa = require('ask-sdk-core');

var request = require('request');

var options_post_slack = {
    url: 'https://hooks.slack.com/services/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',
    
    form: { payload: ''
    },
    json: true
};

const APLDocs = {
  launch: require('./documents/launchRequest.json'),
  staff: require('./documents/staff.json')
};

const staffImage = {
    onsen: "https://s3-ap-northeast-1.amazonaws.com/aajug-apl-handson/onsenbba.jpg",
    show: "https://s3-ap-northeast-1.amazonaws.com/aajug-apl-handson/show.jpg",
    seino: "https://s3-ap-northeast-1.amazonaws.com/aajug-apl-handson/seino.jpg"
};

const staffString = {
    onsen: "おんせん",
    show: "しょう",
    seino: "せーの"
};


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        let speechText = '応援メッセージスキルです。色々頑張りすぎてクタクタになっているスタッフに応援メッセージを送ってあげましょう。おんせんさん、しょうさん、せーのさんの、どなたを応援しますか？';
        const responseBuilder = handlerInput.responseBuilder;
        
        if (supportsAPL(handlerInput)) {
            responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                 document: APLDocs.launch,				
                datasources: {}
            });
        }
        
        return responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CheerIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'CheerIntent';
    },
    handle(handlerInput) {
        
        var staff = handlerInput.requestEnvelope.request.intent.slots.staff.value;
        var staffval = handlerInput.requestEnvelope.request.intent.slots.staff.resolutions.resolutionsPerAuthority[0].values[0].value.name;
         
        const {attributesManager} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes(); 
        sessionAttributes.staff = staff; 
        sessionAttributes.staffval = staffval;
        attributesManager.setSessionAttributes(sessionAttributes); 
         
        const speechText = staff + 'を応援ですね。ありがとうございます。あなたのお名前は何というのですか？下の名前だけで結構ですので教えてください。';
        
        
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

const YourNameIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'YourNameIntent';
    },
    handle(handlerInput) {
        
        var yourname = handlerInput.requestEnvelope.request.intent.slots.name.value;
        
        const {attributesManager} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes(); 
        sessionAttributes.yourname = yourname; 
        
        
        const speechText = yourname + 'さんですね。それでは' + sessionAttributes.staff + 'に応援メッセージを送ります。これで疲れも吹っ飛びますね。ありがとうございました！';
        sendSlack(sessionAttributes.staff, yourname);

        const responseBuilder = handlerInput.responseBuilder;
        
        if (supportsAPL(handlerInput)) {
            
            let staffval = sessionAttributes.staffval;
            let img = "";
            let str = "";
            
            switch (staffval) {
                case "おんせん" :
                    img = staffImage.onsen;
                    str = staffString.onsen;
                    break;
                case "しょう" :
                    img = staffImage.show;
                    str = staffString.show;
                    break;
                case "せーの" :
                    img = staffImage.seino;
                    str = staffString.seino;
                    break;
                        
            }
            
            
            responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                 document: APLDocs.staff,				
                datasources: {
                    cheerData: {
                        properties: {
                            staffImage: img,
                            staffString: str
                        }
                    }
                    
                }
            });
        }
        
        return responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = '色々頑張りすぎてクタクタになっているスタッフをそっと励ますスキルです。おんせんさん、しょうさん、せーのさんの、どなたを応援しますか?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'しゅーりょーです！またお会いしましょう。';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};



// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `エラーだよ。もう一回言ってみて。`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CheerIntentHandler,
        YourNameIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        ) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
    
function supportsAPL(handlerInput) {
  const supportedInterfaces = handlerInput.requestEnvelope.context
    .System.device.supportedInterfaces;
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return aplInterface !== null && aplInterface !== undefined;
}

function sendSlack (staffName, yourName) {
  var notification_msg = yourName + 'さんより' + staffName + 'さんに応援のメッセージが入っております！';
  var random_msg = ['頑張ってね！', 'だからもっと働け、馬車馬のように！', 'あなたをみんな見守っていますよ！', '忙しくなんかない！忙しくなんかないんだ！', 'あと16時間は働けますね！']

  notification_msg += randomPhrase(random_msg);
    options_post_slack.form.payload = '{"text": "' + notification_msg + '"}';
    request.post(options_post_slack, function (error, response, body) {
              if (!error && response.statusCode === 200) {
                 console.log(body);
                 //context.succeed("post succeed.");
              }else{
                  console.log('error: '+ response.statusCode);
                  //context.fail("post failed.");
              }
          });

}

function randomPhrase(myData) {
  // the argument is an array [] of words or phrases
  var i = 0;
  
  i = Math.floor(Math.random() * myData.length);
  
  return(myData[i]);

  }