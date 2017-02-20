define([
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/declare',
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/promise/all",
    'jimu/BaseWidget',

    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "esri/layers/GraphicsLayer",
    "esri/graphic",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "esri/graphicsUtils", 

    "./data/capitols"

], function (

    _WidgetsInTemplateMixin, declare, array, lang, Deferred, all, BaseWidget,
    QueryTask, Query, GraphicsLayer, Graphic, SimpleFillSymbol, SimpleLineSymbol, Color, graphicsUtils,
    CapitolsDataFile
)
{

    // Define your template widget code here
    var StatesAndCapitolsObject = {
        baseClass: 'jimu-widget-StatesAndCapitols',
        statesLayer: null,
        numRight: 0,
        numWrong: 0,
        difficulty: 3,
        postCreate: function ()
        {
            this.inherited(arguments);

            this.statesLayer = this.getLayerByName(this.map, "USA_States_Generalized", true);

            this.possibleAnswersLayer = new GraphicsLayer();
            this.map.addLayer(this.possibleAnswersLayer);

            this.map.on("click", lang.hitch(this, function(event) {
              var query = new Query();
              query.where = "1=1";
              query.returnGeometry = true;
              query.geometry = event.mapPoint;
              query.outFields = ["*"];

              var queryTask = new QueryTask(this.statesLayer.url);
              queryTask.execute(query, lang.hitch(this, function(result) {
                if(result.features.length > 0)
                {
                  if(this.isPossibleAnswer(this.possibleAnswers, result.features[0].attributes.STATE_ABBR))
                  {
                    if(this.isAnswerCorrect(this.currentQuestion, result.features[0].attributes.STATE_ABBR))
                    {
                      this.markAsCorrect();
                      this.displayCurrentScore();
                      this.generateNextQuestion();
                    }
                    else
                    {
                      this.markAsWrong();
                      this.displayCurrentScore();
                      this.generateNextQuestion();
                    }
                  }
                  else
                  {
                    // Not even a possible answer so ignore it.
                  }
                }
              }));
            }));
        },
        onClose: function ()
        {
            this.possibleAnswersLayer.hide();
        },
        onOpen: function ()
        {
            this.possibleAnswersLayer.show();
            this.generateNextQuestion();
        },
        generateNextQuestion: function() {

          this.possibleAnswersLayer.clear();

          // Generate random question
          this.currentQuestion =  this.retrieveRandomItem(CapitolsDataFile.capitols);

          var question = this.currentQuestion.capitol + " is the captol of whch state?";
          this.questionNode.innerHTML = question;

          // Get possible answers.
          this.possibleAnswers = this.getPossibleAnswers(this.currentQuestion, 4);
          // Draw the possible answers on the map
          var promises = [];
          for(var i = 0; i < this.possibleAnswers.length; i++)
          {
            var promise = this.retrieveStateShape(this.possibleAnswers[i], this.statesLayer).then(lang.hitch(this, function(stateGeo) {
              this.drawStateGeo(stateGeo, this.possibleAnswersLayer);
            }));
            promises.push(promise);
          }

          // all(promises).then(lang.hitch(this, function() {
          //   var extent = graphicsUtils.graphicsExtent(this.possibleAnswersLayer.graphics);
          //   extent.expand(1.5);
          //   this.map.setExtent(extent);
          // }));
        },
        getLayerByName: function (map, layerNamePrefix, isGraphicsLayer)
        {
            var layerId, layer;

            if (isGraphicsLayer)
            {
                // Then search the map's graphics layers
                layerId = this.findValueByPrefix(map.graphicsLayerIds, layerNamePrefix);
            }
            else
            {
                // Otherwise search the map's non-graphics layers
                layerId = this.findValueByPrefix(map.layerIds, layerNamePrefix);
            }

            if (layerId)
            {
                // Get the layer reference
                layer = map.getLayer(layerId);
            }
            // Return layer - found or not
            return layer;
        },
        findValueByPrefix: function (searchArray, prefix)
        {
            var foundString;
            array.some(searchArray, function (string)
            {
                var isFound = string.indexOf(prefix) === 0;
                if (isFound)
                {
                    foundString = string;
                }
                return isFound;
            });
            return foundString;
        },
        getPossibleAnswers: function(currentQuestion, numPossibleAnswersTotal) {
          var possibleAnswers = [];

          // The current question must be a possible answer!
          possibleAnswers.push(currentQuestion);

          for(var i = 0; i < numPossibleAnswersTotal - 1; i++)
          {
            // Generate one other possible answer randomly
            var item = this.retrieveRandomItem(CapitolsDataFile.capitols);
            while(this.isAlreadyAPossibleAnswer(item) === true) // Make sure we didn't already have this as an answer
            {
              item = this.retrieveRandomItem(CapitolsDataFile.capitols);
            }
            possibleAnswers.push(item);
          }

          return possibleAnswers;
        },
        isAlreadyAPossibleAnswer: function(possibleAnswers, currentAnswer)
        {
          isAlreadyPossibleAnswer = false

          for(var i = 0; i < possibleAnswers.length; i++)
          {
            if(possibleAnswers[i].abbr === currentAnswer.abbr)
            {
              isAlreadyPossibleAnswer = true;
              break;
            }
          }

          return isAlreadyPossibleAnswer;
        },
        retrieveRandomItem: function(optionsList)
        {
          var index = Math.floor(Math.random() * optionsList.length) + 1;
          index--;
          console.log(index);
          return optionsList[index];
        },
        retrieveStateShape: function(statetoDraw, layerToObtainPolyFrom)
        {
          var def = new Deferred();

          var query = new Query();
          query.where = "STATE_ABBR='" + statetoDraw.abbr + "'";
          query.returnGeometry = true;
          query.outFields = ["*"];

          var queryTask = new QueryTask(layerToObtainPolyFrom.url);
          queryTask.execute(query, lang.hitch(this, function(result) {

            def.resolve(result.features[0].geometry);
          }));

          return def.promise;
        },
        drawStateGeo: function(stateGeo, graphicsLayer)
        {
          var stateSymbol = new SimpleFillSymbol();
          stateSymbol.setOutline(new SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([125, 24, 24]), 2));
          stateSymbol.setColor(new Color([171, 29, 29]));

          var graphic = new Graphic(stateGeo, stateSymbol);
          graphicsLayer.add(graphic);
        },
        isAnswerCorrect: function(currentQuestion, answerStateAbbr)
        {
          var isCorrect = false;
          if(currentQuestion.abbr === answerStateAbbr)
          {
            isCorrect = true;
          }

          return isCorrect;
        },
        isPossibleAnswer: function(possibleAnswers, stateAbbr)
        {
          var isPossibleAnswer = false;

          for(var i = 0; i < possibleAnswers.length; i++)
          {
            if(possibleAnswers[i].abbr === stateAbbr)
            {
              isPossibleAnswer = true;
              break;
            }
          }

          return isPossibleAnswer;
        },
        reset: function()
        {
          this.numRight = 0;
          this.numWrong = 0;
        },
        markAsCorrect: function()
        {
          this.numRight++;
        },
        markAsWrong: function()
        {
          this.numWrong++;
        },
        displayCurrentScore: function()
        {
          this.correctNode.innerHTML = this.numRight.toString();
          this.wrongNode.innerHTML = this.numWrong.toString();
        }
    };

    //To create a widget, you need to derive from BaseWidget.
    var StatesAndCapitolsClass = declare([BaseWidget, _WidgetsInTemplateMixin], StatesAndCapitolsObject);
    return StatesAndCapitolsClass;
});
