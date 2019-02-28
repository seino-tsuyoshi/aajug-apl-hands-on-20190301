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
    onsen: "���񂹂�",
    show: "���傤",
    seino: "���[��"
};


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        let speechText = '�������b�Z�[�W�X�L���ł��B�F�X�撣�肷���ăN�^�N�^�ɂȂ��Ă���X�^�b�t�ɉ������b�Z�[�W�𑗂��Ă����܂��傤�B���񂹂񂳂�A���傤����A���[�̂���́A�ǂȂ����������܂����H';
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
         
        const speechText = staff + '�������ł��ˁB���肪�Ƃ��������܂��B���Ȃ��̂����O�͉��Ƃ����̂ł����H���̖��O�����Ō��\�ł��̂ŋ����Ă��������B';
        
        
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
        
        
        const speechText = yourname + '����ł��ˁB����ł�' + sessionAttributes.staff + '�ɉ������b�Z�[�W�𑗂�܂��B����Ŕ���������т܂��ˁB���肪�Ƃ��������܂����I';
        sendSlack(sessionAttributes.staff, yourname);

        const responseBuilder = handlerInput.responseBuilder;
        
        if (supportsAPL(handlerInput)) {
            
            let staffval = sessionAttributes.staffval;
            let img = "";
            let str = "";
            
            switch (staffval) {
                case "���񂹂�" :
                    img = staffImage.onsen;
                    str = staffString.onsen;
                    break;
                case "���傤" :
                    img = staffImage.show;
                    str = staffString.show;
                    break;
                case "���[��" :
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
        const speechText = '�F�X�撣�肷���ăN�^�N�^�ɂȂ��Ă���X�^�b�t�������Ɨ�܂��X�L���ł��B���񂹂񂳂�A���傤����A���[�̂���́A�ǂȂ����������܂���?';

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
        const speechText = '����[���[�ł��I�܂�������܂��傤�B';
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
        const speechText = `�G���[����B������񌾂��Ă݂āB`;

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
  var notification_msg = yourName + '������' + staffName + '����ɉ����̃��b�Z�[�W�������Ă���܂��I';
  var random_msg = ['�撣���ĂˁI', '����������Ɠ����A�n�Ԕn�̂悤�ɁI', '���Ȃ����݂�Ȍ�����Ă��܂���I', '�Z�����Ȃ񂩂Ȃ��I�Z�����Ȃ񂩂Ȃ��񂾁I', '����16���Ԃ͓����܂��ˁI']

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