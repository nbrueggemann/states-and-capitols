define([
    "dojo/_base/declare",
    "dojo/_base/array",

    'libs/custom/tasks/CoordinateLocator'
], function(
    declare, array,
    CoordinateLocator
)
{

    var Locator = declare([CoordinateLocator],
    {
        declaredClass: "libs.opir.tasks.DDCoordinateLocator",

        isThisCoordType: function( /*String*/ singleLine)
        {
            return this.coordConv.isDD(singleLine);
        },

        obtainCandidates: function( /*String*/ singleLine)
        {
            return this.coordConv.parseDD(singleLine);
        },

        parseCandidates: function(candidates, singleLine)
        {
            var candidateResults = [];
            array.forEach(candidates, function(candidate)
            {
                candidateResults.push(
                {
                    "address": "Lon: " + candidate.x + ", " + "Lat: " + candidate.y,
                    "location":
                    {
                        "x": candidate.x,
                        "y": candidate.y
                    },
                    "score": 99,
                    "attributes":
                    {
                        "X": candidate.x,
                        "Y": candidate.y,
                        "DisplayX": candidate.x,
                        "DisplayY": candidate.y
                    }
                });
            });
            return candidateResults;
        },

        parseSuggestions: function(candidates, singleLine)
        {
            var suggestions = [];
            array.forEach(candidates, function(candidate)
            {
                var xValue = candidate.x;
                var yValue = candidate.y;

                suggestions.push(
                {
                    "text": yValue + ", " + xValue,
                    "name": "Lat: " + candidate.y + ", Lon: " + candidate.x,
                    "FORMATTEDADDRESS": "",
                    "magicKey": singleLine,
                    "isCollection": true
                });
            });
            return suggestions;
        }
    });

    return Locator;
});
