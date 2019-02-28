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