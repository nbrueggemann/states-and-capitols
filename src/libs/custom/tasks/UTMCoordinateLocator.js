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
        declaredClass: "libs.opir.tasks.UTMCoordinateLocator",

        isThisCoordType: function( /*String*/ singleLine)
        {
            return this.coordConv.convertUtmToPoint(singleLine);
        },

        obtainCandidates: function( /*String*/ singleLine)
        {
            return [this.coordConv.convertUtmToPoint(singleLine)];
        },

        parseCandidates: function(candidates, singleLine)
        {
            var candidateResults = [];
            array.forEach(candidates, function(candidate)
            {
                candidateResults.push(
                {
                    "address": singleLine,
                    "location":
                    {
                        "x": candidate.x,
                        "y": candidate.y
                    },
                    "score": 99,
                    "attributes":
                    {
                        "UTMCoordinate": singleLine,
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
                    "text": singleLine,
                    "name": singleLine,
                    "FORMATTEDADDRESS": "",
                    "magicKey": singleLine,
                    "isCollection": false
                });
            });
            return suggestions;
        }
    });

    return Locator;
});
