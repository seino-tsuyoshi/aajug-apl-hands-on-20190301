const Alexa = require('ask-sdk-core');

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
        let speechText = '�������b�Z�[�W�X�L���ł��B�F�X�撣�肷���ăN�^�N�^�ɂȂ��Ă���X�^�b�t�ɉ������b�Z�[�W�𑗂��Ă����܂��傤�B';
        const responseBuilder = handlerInput.responseBuilder;
        
        if (supportsAPL(handlerInput)) {
           
            let aplCommands = [
                {
                    "type": "Sequential",
                    "commands": [
                        {
                            "type": "Parallel",
                            "commands": [
                                {
                                    "type": "SetPage", 
                                    "componentId": "staffinfo",
                                    "position": "absolute",
                                    "value": 1
                                },
                                {
                                    "type": "SpeakItem",
                                    "componentId": "SpeechOnsen" 
                                }
                            ]
                        },
                        {
                            "type": "Parallel",
                            "commands": [
                                {
                                    "type": "SetPage", 
                                    "componentId": "staffinfo",
                                    "position": "absolute",
                                    "value": 2
                                },
                                {
                                    "type": "SpeakItem",
                                    "componentId": "SpeechShow" 
                                }
                            ]
                        },
                        {
                            "type": "Parallel",
                            "commands": [
                                {
                                    "type": "SetPage", 
                                    "componentId": "staffinfo",
                                    "position": "absolute",
                                    "value": 3
                                },
                                {
                                    "type": "SpeakItem",
                                    "componentId": "SpeechSeino" 
                                }
                            ]
                        },
                        {
                            "type": "Parallel",
                            "commands": [
                                {
                                    "type": "SetPage", 
                                    "componentId": "staffinfo",
                                    "position": "absolute",
                                    "value": 0
                                },
                                {
                                    "type": "SpeakItem",
                                    "componentId": "SpeechRest" 
                                }
                            ]
                        }
                    ]
                }
            ];
            
            
            const aplDirective = {
            	type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                token: 'aplToken',
                document: APLDocs.launch,				
                datasources: {
                    cheerData: {
                        properties: {
                            "SsmlOnsen": "<speak><prosody volume='x-loud'>���񂹂񂳂�</prosody></speak>",
                            "SsmlShow": "<speak><prosody volume='x-loud'>���傤����</prosody></speak>",
                            "SsmlSeino": "<speak><prosody volume='x-loud'>���[�̂���</prosody></speak>",
                            "SsmlRest": "<speak><prosody volume='x-loud'>�ǂȂ����������܂����H</prosody></speak>"
                        },
                        transformers: [
                            {
                              inputPath: "SsmlOnsen",
                              outputName: "OnsenSpeech",
                              transformer: "ssmlToSpeech" 
                            },
                            {
                                inputPath: "SsmlShow",
                                outputName: "ShowSpeech",
                                transformer: "ssmlToSpeech" 
                            },
                            {
                                inputPath: "SsmlSeino",
                                outputName: "SeinoSpeech",
                                transformer: "ssmlToSpeech" 
                            },
                            {
                                inputPath: "SsmlRest",
                                outputName: "RestSpeech",
                                transformer: "ssmlToSpeech" 
                            }
                            
                        ]
                    }
                }
            }
            const commandDirective = {
            	type: 'Alexa.Presentation.APL.ExecuteCommands',
            	version: '1.0',
            	token: 'aplToken',
            	commands: aplCommands, 
            };
            
            responseBuilder.addDirective(aplDirective)
            .addDirective(commandDirective);
            
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
        ) 
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
    
function supportsAPL(handlerInput) {
  const supportedInterfaces = handlerInput.requestEnvelope.context
    .System.device.supportedInterfaces;
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return aplInterface !== null && aplInterface !== undefined;
}
