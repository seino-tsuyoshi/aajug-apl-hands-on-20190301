const Alexa = require('ask-sdk-core');

const APLDocs = {
  launch: require('./documents/launchRequest.json')
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
        const responseBuilder = handlerInput.responseBuilder;
        
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
  return aplInterface != null && aplInterface !== undefined;
}