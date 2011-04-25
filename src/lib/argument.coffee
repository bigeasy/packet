# Docco hates this file, so we put it aside for now.

# Regular expression to match a pipeline argument, expressed as a JavaScript
# scalar, taken in part from [json2.js](http://www.JSON.org/json2.js). 
module.exports = ///
  ( '(?:[^\\']|\\.)+'|"(?:[^\\"]|\\.)+"   # string
  | true | false                          # boolean
  | null                                  # null
  | -?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?     # number
  )    
  (\s*,\s*|\s*\))?                      # remaining arguments
  (.*)                                  # remaining pattern
///
