
/**
 * Wrapper for Firebug's console.debug()
 * 
 * If the browser does not support it nothing happens.
 * 
 * @param object Anything to display in Firebug console
 */
function debug(object) {
	if (window['console']) {
		console.debug(object);
	}
}

/**
 * Wrapper for Firebug's console.log()
 * 
 * If the browser does not support it nothing happens.
 * 
 * @param object Anything to display in Firebug console
 */
function log(object) {
	if (window['console']) {
		console.log(object);
	}
}

/**
 * TrimPath Template. Release 1.0.38.
 * Copyright (C) 2004, 2005 Metaha.
 * 
 * TrimPath Template is licensed under the GNU General Public License
 * and the Apache License, Version 2.0, as follows:
 *
 * This program is free software; you can redistribute it and/or 
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed WITHOUT ANY WARRANTY; without even the 
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
 * See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var TrimPath;

// TODO: Debugging mode vs stop-on-error mode - runtime flag.
// TODO: Handle || (or) characters and backslashes.
// TODO: Add more modifiers.

(function() {               // Using a closure to keep global namespace clean.
    if (TrimPath == null)
        TrimPath = new Object();
    if (TrimPath.evalEx == null)
        TrimPath.evalEx = function(src) { return eval(src); };

    var UNDEFINED;
    if (Array.prototype.pop == null)  // IE 5.x fix from Igor Poteryaev.
        Array.prototype.pop = function() {
            if (this.length === 0) {return UNDEFINED;}
            return this[--this.length];
        };
    if (Array.prototype.push == null) // IE 5.x fix from Igor Poteryaev.
        Array.prototype.push = function() {
            for (var i = 0; i < arguments.length; ++i) {this[this.length] = arguments[i];}
            return this.length;
        };

    TrimPath.parseTemplate = function(tmplContent, optTmplName, optEtc) {
        if (optEtc == null)
            optEtc = TrimPath.parseTemplate_etc;
        var funcSrc = parse(tmplContent, optTmplName, optEtc);
        var func = TrimPath.evalEx(funcSrc, optTmplName, 1);
        if (func != null)
            return new optEtc.Template(optTmplName, tmplContent, funcSrc, func, optEtc);
        return null;
    }
    
    try {
        String.prototype.process = function(context, optFlags) {
            var template = TrimPath.parseTemplate(this, null);
            if (template != null)
                return template.process(context, optFlags);
            return this;
        }
    } catch (e) { // Swallow exception, such as when String.prototype is sealed.
    }
    
    TrimPath.parseTemplate_etc = {};            // Exposed for extensibility.
    TrimPath.parseTemplate_etc.statementTag = "forelse|for|if|elseif|else|var|macro";
    TrimPath.parseTemplate_etc.statementDef = { // Lookup table for statement tags.
        "if"     : { delta:  1, prefix: "if (", suffix: ") {", paramMin: 1 },
        "else"   : { delta:  0, prefix: "} else {" },
        "elseif" : { delta:  0, prefix: "} else if (", suffix: ") {", paramDefault: "true" },
        "/if"    : { delta: -1, prefix: "}" },
        "for"    : { delta:  1, paramMin: 3, 
                     prefixFunc : function(stmtParts, state, tmplName, etc) {
                        if (stmtParts[2] != "in")
                            throw new etc.ParseError(tmplName, state.line, "bad for loop statement: " + stmtParts.join(' '));
                        var iterVar = stmtParts[1];
                        var listVar = "__LIST__" + iterVar;
                        return [ "var ", listVar, " = ", stmtParts[3], ";",
                             // Fix from Ross Shaull for hash looping, make sure that we have an array of loop lengths to treat like a stack.
                             "var __LENGTH_STACK__;",
                             "if (typeof(__LENGTH_STACK__) == 'undefined' || !__LENGTH_STACK__.length) __LENGTH_STACK__ = new Array();", 
                             "__LENGTH_STACK__[__LENGTH_STACK__.length] = 0;", // Push a new for-loop onto the stack of loop lengths.
                             "if ((", listVar, ") != null) { ",
                             "var ", iterVar, "_ct = 0;",       // iterVar_ct variable, added by B. Bittman     
                             "for (var ", iterVar, "_index in ", listVar, ") { ",
                             iterVar, "_ct++;",
                             "if (typeof(", listVar, "[", iterVar, "_index]) == 'function') {continue;}", // IE 5.x fix from Igor Poteryaev.
                             "__LENGTH_STACK__[__LENGTH_STACK__.length - 1]++;",
                             "var ", iterVar, " = ", listVar, "[", iterVar, "_index];" ].join("");
                     } },
        "forelse" : { delta:  0, prefix: "} } if (__LENGTH_STACK__[__LENGTH_STACK__.length - 1] == 0) { if (", suffix: ") {", paramDefault: "true" },
        "/for"    : { delta: -1, prefix: "} }; delete __LENGTH_STACK__[__LENGTH_STACK__.length - 1];" }, // Remove the just-finished for-loop from the stack of loop lengths.
        "var"     : { delta:  0, prefix: "var ", suffix: ";" },
        "macro"   : { delta:  1, 
                      prefixFunc : function(stmtParts, state, tmplName, etc) {
                          var macroName = stmtParts[1].split('(')[0];
                          return [ "var ", macroName, " = function", 
                                   stmtParts.slice(1).join(' ').substring(macroName.length),
                                   "{ var _OUT_arr = []; var _OUT = { write: function(m) { if (m) _OUT_arr.push(m); } }; " ].join('');
                     } }, 
        "/macro"  : { delta: -1, prefix: " return _OUT_arr.join(''); };" }
    }
    TrimPath.parseTemplate_etc.modifierDef = {
        "eat"        : function(v)    { return ""; },
        "escape"     : function(s)    { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); },
        "capitalize" : function(s)    { return String(s).toUpperCase(); },
        "default"    : function(s, d) { return s != null ? s : d; }
    }
    TrimPath.parseTemplate_etc.modifierDef.h = TrimPath.parseTemplate_etc.modifierDef.escape;

    TrimPath.parseTemplate_etc.Template = function(tmplName, tmplContent, funcSrc, func, etc) {
        this.process = function(context, flags) {
            if (context == null)
                context = {};
            if (context._MODIFIERS == null)
                context._MODIFIERS = {};
            if (context.defined == null)
                context.defined = function(str) { return (context[str] != undefined); };
            for (var k in etc.modifierDef) {
                if (context._MODIFIERS[k] == null)
                    context._MODIFIERS[k] = etc.modifierDef[k];
            }
            if (flags == null)
                flags = {};
            var resultArr = [];
            var resultOut = { write: function(m) { resultArr.push(m); } };
            try {
                func(resultOut, context, flags);
            } catch (e) {
                if (flags.throwExceptions == true)
                    throw e;
                var result = new String(resultArr.join("") + "[ERROR: " + e.toString() + (e.message ? '; ' + e.message : '') + "]");
                result["exception"] = e;
                return result;
            }
            return resultArr.join("");
        }
        this.name       = tmplName;
        this.source     = tmplContent; 
        this.sourceFunc = funcSrc;
        this.toString   = function() { return "TrimPath.Template [" + tmplName + "]"; }
    }
    TrimPath.parseTemplate_etc.ParseError = function(name, line, message) {
        this.name    = name;
        this.line    = line;
        this.message = message;
    }
    TrimPath.parseTemplate_etc.ParseError.prototype.toString = function() { 
        return ("TrimPath template ParseError in " + this.name + ": line " + this.line + ", " + this.message);
    }
    
    var parse = function(body, tmplName, etc) {
        body = cleanWhiteSpace(body);
        var funcText = [ "var TrimPath_Template_TEMP = function(_OUT, _CONTEXT, _FLAGS) { with (_CONTEXT) {" ];
        var state    = { stack: [], line: 1 };                              // TODO: Fix line number counting.
        var endStmtPrev = -1;
        while (endStmtPrev + 1 < body.length) {
            var begStmt = endStmtPrev;
            // Scan until we find some statement markup.
            begStmt = body.indexOf("{", begStmt + 1);
            while (begStmt >= 0) {
                var endStmt = body.indexOf('}', begStmt + 1);
                var stmt = body.substring(begStmt, endStmt);
                var blockrx = stmt.match(/^\{(cdata|minify|eval)/); // From B. Bittman, minify/eval/cdata implementation.
                if (blockrx) {
                    var blockType = blockrx[1]; 
                    var blockMarkerBeg = begStmt + blockType.length + 1;
                    var blockMarkerEnd = body.indexOf('}', blockMarkerBeg);
                    if (blockMarkerEnd >= 0) {
                        var blockMarker;
                        if( blockMarkerEnd - blockMarkerBeg <= 0 ) {
                            blockMarker = "{/" + blockType + "}";
                        } else {
                            blockMarker = body.substring(blockMarkerBeg + 1, blockMarkerEnd);
                        }                        
                        
                        var blockEnd = body.indexOf(blockMarker, blockMarkerEnd + 1);
                        if (blockEnd >= 0) {                            
                            emitSectionText(body.substring(endStmtPrev + 1, begStmt), funcText);
                            
                            var blockText = body.substring(blockMarkerEnd + 1, blockEnd);
                            if (blockType == 'cdata') {
                                emitText(blockText, funcText);
                            } else if (blockType == 'minify') {
                                emitText(scrubWhiteSpace(blockText), funcText);
                            } else if (blockType == 'eval') {
                                if (blockText != null && blockText.length > 0) // From B. Bittman, eval should not execute until process().
                                    funcText.push('_OUT.write( (function() { ' + blockText + ' })() );');
                            }
                            begStmt = endStmtPrev = blockEnd + blockMarker.length - 1;
                        }
                    }                        
                } else if (body.charAt(begStmt - 1) != '$' &&               // Not an expression or backslashed,
                           body.charAt(begStmt - 1) != '\\') {              // so check if it is a statement tag.
                    var offset = (body.charAt(begStmt + 1) == '/' ? 2 : 1); // Close tags offset of 2 skips '/'.
                                                                            // 10 is larger than maximum statement tag length.
                    if (body.substring(begStmt + offset, begStmt + 10 + offset).search(TrimPath.parseTemplate_etc.statementTag) == 0) 
                        break;                                              // Found a match.
                }
                begStmt = body.indexOf("{", begStmt + 1);
            }
            if (begStmt < 0)                              // In "a{for}c", begStmt will be 1.
                break;
            var endStmt = body.indexOf("}", begStmt + 1); // In "a{for}c", endStmt will be 5.
            if (endStmt < 0)
                break;
            emitSectionText(body.substring(endStmtPrev + 1, begStmt), funcText);
            emitStatement(body.substring(begStmt, endStmt + 1), state, funcText, tmplName, etc);
            endStmtPrev = endStmt;
        }
        emitSectionText(body.substring(endStmtPrev + 1), funcText);
        if (state.stack.length != 0)
            throw new etc.ParseError(tmplName, state.line, "unclosed, unmatched statement(s): " + state.stack.join(","));
        funcText.push("}}; TrimPath_Template_TEMP");
        return funcText.join("");
    }
    
    var emitStatement = function(stmtStr, state, funcText, tmplName, etc) {
        var parts = stmtStr.slice(1, -1).split(' ');
        var stmt = etc.statementDef[parts[0]]; // Here, parts[0] == for/if/else/...
        if (stmt == null) {                    // Not a real statement.
            emitSectionText(stmtStr, funcText);
            return;
        }
        if (stmt.delta < 0) {
            if (state.stack.length <= 0)
                throw new etc.ParseError(tmplName, state.line, "close tag does not match any previous statement: " + stmtStr);
            state.stack.pop();
        } 
        if (stmt.delta > 0)
            state.stack.push(stmtStr);

        if (stmt.paramMin != null &&
            stmt.paramMin >= parts.length)
            throw new etc.ParseError(tmplName, state.line, "statement needs more parameters: " + stmtStr);
        if (stmt.prefixFunc != null)
            funcText.push(stmt.prefixFunc(parts, state, tmplName, etc));
        else 
            funcText.push(stmt.prefix);
        if (stmt.suffix != null) {
            if (parts.length <= 1) {
                if (stmt.paramDefault != null)
                    funcText.push(stmt.paramDefault);
            } else {
                for (var i = 1; i < parts.length; i++) {
                    if (i > 1)
                        funcText.push(' ');
                    funcText.push(parts[i]);
                }
            }
            funcText.push(stmt.suffix);
        }
    }

    var emitSectionText = function(text, funcText) {
        if (text.length <= 0)
            return;
        var nlPrefix = 0;               // Index to first non-newline in prefix.
        var nlSuffix = text.length - 1; // Index to first non-space/tab in suffix.
        while (nlPrefix < text.length && (text.charAt(nlPrefix) == '\n'))
            nlPrefix++;
        while (nlSuffix >= 0 && (text.charAt(nlSuffix) == ' ' || text.charAt(nlSuffix) == '\t'))
            nlSuffix--;
        if (nlSuffix < nlPrefix)
            nlSuffix = nlPrefix;
        if (nlPrefix > 0) {
            funcText.push('if (_FLAGS.keepWhitespace == true) _OUT.write("');
            var s = text.substring(0, nlPrefix).replace('\n', '\\n'); // A macro IE fix from BJessen.
            if (s.charAt(s.length - 1) == '\n')
            	s = s.substring(0, s.length - 1);
            funcText.push(s);
            funcText.push('");');
        }
        var lines = text.substring(nlPrefix, nlSuffix + 1).split('\n');
        for (var i = 0; i < lines.length; i++) {
            emitSectionTextLine(lines[i], funcText);
            if (i < lines.length - 1)
                funcText.push('_OUT.write("\\n");\n');
        }
        if (nlSuffix + 1 < text.length) {
            funcText.push('if (_FLAGS.keepWhitespace == true) _OUT.write("');
            var s = text.substring(nlSuffix + 1).replace('\n', '\\n');
            if (s.charAt(s.length - 1) == '\n')
            	s = s.substring(0, s.length - 1);
            funcText.push(s);
            funcText.push('");');
        }
    }
    
    var emitSectionTextLine = function(line, funcText) {
        var endMarkPrev = '}';
        var endExprPrev = -1;
        while (endExprPrev + endMarkPrev.length < line.length) {
            var begMark = "${", endMark = "}";
            var begExpr = line.indexOf(begMark, endExprPrev + endMarkPrev.length); // In "a${b}c", begExpr == 1
            if (begExpr < 0)
                break;
            if (line.charAt(begExpr + 2) == '%') {
                begMark = "${%";
                endMark = "%}";
            }
            var endExpr = line.indexOf(endMark, begExpr + begMark.length);         // In "a${b}c", endExpr == 4;
            if (endExpr < 0)
                break;
            emitText(line.substring(endExprPrev + endMarkPrev.length, begExpr), funcText);                
            // Example: exprs == 'firstName|default:"John Doe"|capitalize'.split('|')
            var exprArr = line.substring(begExpr + begMark.length, endExpr).replace(/\|\|/g, "#@@#").split('|');
            for (var k in exprArr) {
                if (exprArr[k].replace) // IE 5.x fix from Igor Poteryaev.
                    exprArr[k] = exprArr[k].replace(/#@@#/g, '||');
            }
            funcText.push('_OUT.write(');
            emitExpression(exprArr, exprArr.length - 1, funcText); 
            funcText.push(');');
            endExprPrev = endExpr;
            endMarkPrev = endMark;
        }
        emitText(line.substring(endExprPrev + endMarkPrev.length), funcText); 
    }
    
    var emitText = function(text, funcText) {
        if (text == null ||
            text.length <= 0)
            return;
        text = text.replace(/\\/g, '\\\\');
        text = text.replace(/\n/g, '\\n');
        text = text.replace(/"/g,  '\\"');
        funcText.push('_OUT.write("');
        funcText.push(text);
        funcText.push('");');
    }
    
    var emitExpression = function(exprArr, index, funcText) {
        // Ex: foo|a:x|b:y1,y2|c:z1,z2 is emitted as c(b(a(foo,x),y1,y2),z1,z2)
        var expr = exprArr[index]; // Ex: exprArr == [firstName,capitalize,default:"John Doe"]
        if (index <= 0) {          // Ex: expr    == 'default:"John Doe"'
            funcText.push(expr);
            return;
        }
        var parts = expr.split(':');
        funcText.push('_MODIFIERS["');
        funcText.push(parts[0]); // The parts[0] is a modifier function name, like capitalize.
        funcText.push('"](');
        emitExpression(exprArr, index - 1, funcText);
        if (parts.length > 1) {
            funcText.push(',');
            funcText.push(parts[1]);
        }
        funcText.push(')');
    }

    var cleanWhiteSpace = function(result) {
        result = result.replace(/\t/g,   "    ");
        result = result.replace(/\r\n/g, "\n");
        result = result.replace(/\r/g,   "\n");
        result = result.replace(/^(\s*\S*(\s+\S+)*)\s*$/, '$1'); // Right trim by Igor Poteryaev.
        return result;
    }

    var scrubWhiteSpace = function(result) {
        result = result.replace(/^\s+/g,   "");
        result = result.replace(/\s+$/g,   "");
        result = result.replace(/\s+/g,   " ");
        result = result.replace(/^(\s*\S*(\s+\S+)*)\s*$/, '$1'); // Right trim by Igor Poteryaev.
        return result;
    }

    // The DOM helper functions depend on DOM/DHTML, so they only work in a browser.
    // However, these are not considered core to the engine.
    //
    TrimPath.parseDOMTemplate = function(elementId, optDocument, optEtc) {
        if (optDocument == null)
            optDocument = document;
        var element = optDocument.getElementById(elementId);
        var content = element.value;     // Like textarea.value.
        if (content == null)
            content = element.innerHTML; // Like textarea.innerHTML.
        content = content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        return TrimPath.parseTemplate(content, elementId, optEtc);
    }

    TrimPath.processDOMTemplate = function(elementId, context, optFlags, optDocument, optEtc) {
        return TrimPath.parseDOMTemplate(elementId, optDocument, optEtc).process(context, optFlags);
    }
}) ();

jQuery.jlm = {
    base: '',
    params: {},
    components: {},
    controllers: {},
    templates: {},
    
    addCallback: function(controller, action, callback) {
        // Add callback to controllers hash
        if (typeof(jQuery.jlm.controllers[controller]) == 'undefined') {
            jQuery.jlm.controllers[controller] = {};
        }
        if (typeof(jQuery.jlm.controllers[controller][action]) == 'undefined') {
            jQuery.jlm.controllers[controller][action] = [];
        }

        jQuery.jlm.controllers[controller][action].push(callback);
    },

    /**
     * Bind code to a controller and it`s actions
     *
     * @param mixed routes Could be controller alone, controller.action or more of these
     *     separated by a comma. Examples: pages, pages.edit, posts.add
     * @param function callback Code that gets executed on when controller & actions is
     *     loaded
     */
    bind: function(routes, callback) {
        // Parse routes
        var routesArr = routes.split(',');
        
        jQuery.each(routesArr, function() {
            var route = jQuery.jlm.trim(this);
            var parts = route.split('.');
            
            var controller = '';
            var action = '';
            
            if (parts.length == 2) {
                // Controller & action is defined
                controller = parts[0];
                action = parts[1]; 
            } else if (parts.length == 1) {
                // Only controller defined
                controller = parts[0];
                action = '__global';
            } else {
                return alert('JLM error: Routes paramter should be in controller.action format!');
            }
            
            jQuery.jlm.addCallback(controller, action, callback);
        });
    },
    
    addComponent: function(name, object) {
        this.components[name] = object;
    },
    
    component: function(name, initOn, componentFunction) {
        jQuery.jlm.components[name] = {
            startup: componentFunction,
            initOn: initOn
        };
    },
    
    config: function(params) {
        this.base = params.base;
        this.params.controller = params.controller;
        this.params.action = params.action;
        this.params.prefix = params.prefix;
        this.params.custom = params.custom;
    },
    
    /**
     * Get template content by path
     * 
     * @param string templatePath
     */
    getTemplate: function(templatePath) {
        tparts = templatePath.split('/');
        var content = null;

        // default: templatePath is a template name only
        var dir = this.params.controller;
        var template = templatePath;

        // templatePath is a path
        if (tparts.length == 2) {
            dir = tparts[0];
            template = tparts[1];
        }

        if (typeof(jQuery.jlm.templates[dir]) == 'undefined') {
            return content;
        }

        if (typeof(jQuery.jlm.templates[dir][template]) !== 'undefined') {
            content = jQuery.jlm.templates[dir][template];
        }

        return content;
    },
    
    dispatch: function() {
        // Execute app_controllers beforeFilter
        if (typeof(jQuery.jlm.controllers['app_controller']) == 'object'
            && typeof(jQuery.jlm.controllers['app_controller']['beforeFilter']) == 'object') {
            jQuery.jlm.execute('app_controller', 'beforeFilter');
        }
            
        // Execute app_controllers functions bound to current action
        if (typeof(jQuery.jlm.controllers['app_controller']) == 'object'
            && typeof(jQuery.jlm.controllers['app_controller'][jQuery.jlm.params.action]) == 'object') {
            jQuery.jlm.execute('app_controller', jQuery.jlm.params.action);
        }
        
        // Execute all functions bound to current controller and action
        if (typeof(jQuery.jlm.controllers[jQuery.jlm.params.controller]) == 'object'
            && typeof(jQuery.jlm.controllers[jQuery.jlm.params.controller][jQuery.jlm.params.action]) == 'object') {
            jQuery.jlm.execute(jQuery.jlm.params.controller, jQuery.jlm.params.action);
        }
        
        // Execute components that have initOn defined
        // @TODO rethink and refactor
        jQuery.each(jQuery.jlm.components, function() {
            if (typeof(this.initOn) === 'string') {
                if (this.initOn === '*') {
                    return this.startup();
                }
                
                // Parse initOn
                var routesArr = this.initOn.split(',');
                var execute = false;

                jQuery.each(routesArr, function() {
                    var route = jQuery.jlm.trim(this);
                    var parts = route.split('.');
                    var controller = '';
                    var action = '';

                    if (parts.length == 2) {
                        // Controller & action is defined
                        controller = parts[0];
                        action = parts[1]; 
                        if (jQuery.jlm.params.controller == controller && jQuery.jlm.params.action == action) {
                            execute = true;
                        }
                    } else if (parts.length == 1) {
                        // Only controller defined
                        controller = parts[0];
                        if (jQuery.jlm.params.controller == controller) {
                            execute = true;
                        }
                    }
                });
                
                if (execute) {
                    this.startup();
                }
            }
        });
    },
    
    execute: function(controller, action, args) {
        jQuery.each(this.controllers[controller][action], function() {
            this.apply(this, [args]);
        });
    },
    
    redirect: function(url, appendBase) {
        if (typeof(appendBase) === 'undefined') appendBase = true;
        var absUrl = url;
        if (appendBase) absUrl = jQuery.jlm.base + absUrl;
        window.location.href = absUrl;
    },
    
    /**
     * Return a parsed template filled with view variables
     * 
     * @param string templatePath
     * @param hash viewVars
     * @return string Template content
     */
    template: function(templatePath, viewVars) {
        var templateContent = this.getTemplate(templatePath);
        if (templateContent == null) {
            alert('JLM template "jlm/views/' + templatePath + '.html" is not present!');
            return null;
        }

        var template = TrimPath.parseTemplate(templateContent);

        if (typeof(viewVars) == 'undefined') {
            viewVars = {};
        }

        // BASE param for all templates
        viewVars.BASE = this.base;
        viewVars.PREFIX = this.params.prefix;

        return template.process(viewVars);
    },
    
    /**
     * Shortcut for returning a views/elements/...
     * 
     * @param string templatePath
     * @param hash viewVars
     * @return string Template content
     */
    element: function(elementName, viewVars) {
        return $.jlm.template('elements/' + elementName, viewVars);
    },
    
    /**
     * Trim a string
     *
     * @link http://www.webtoolkit.info/javascript-trim.html
     *
     * @param string str String to trim
     * @param string chars Trimmed characters
     * @return string
     */
    trim: function(str, chars) {
        function ltrim(str, chars) {
            chars = chars || "\\s";
            return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
        }

        function rtrim(str, chars) {
            chars = chars || "\\s";
            return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
        }
        
        return ltrim(rtrim(str, chars), chars);
    }

};
jQuery.jlm.templates['elements'] = [];
jQuery.jlm.templates['elements']['edit_comment'] = '<form class="edit-comment" method="post" action="${BASE}/admin/comments/update">    <div class="input">        <textarea name="data[Comment][content]" rows="6" cols="25"></textarea>    </div>    <div class="submit">    	<input type="hidden" name="data[Comment][id]" value="${commentId}" />        <input type="submit" value="Save" /> <a class="cancel-edit-comment" href="#Cancel">Cancel</a>    </div></form>';
jQuery.jlm.templates['elements']['preview'] = '<div id="preview">	<iframe src="${iframeSrc}" width="100%" height="100%" frameborder="0"></iframe></div>';
jQuery.jlm.templates['elements']['switcher'] = '<div id="switcher-bg"></div><ul id="switcher">	<li><a href="${BASE}/${PREFIX}"><img alt="Dashboard" src="${BASE}/img/switcher/dashboard.png" /><span>Dashboard</span></a></li>	<li><a href="${BASE}/${PREFIX}/pages"><img alt="Dashboard" src="${BASE}/img/switcher/pages.png" /><span>Pages</span></a></li>	<li><a href="${BASE}/${PREFIX}/posts"><img alt="Dashboard" src="${BASE}/img/switcher/posts.png" /><span>Posts</span></a></li>	<li><a href="${BASE}/${PREFIX}/comments"><img alt="Dashboard" src="${BASE}/img/switcher/comments.png" /><span>Comments</span></a></li>	<li><a href="${BASE}/${PREFIX}/messages"><img alt="Messages" src="${BASE}/img/switcher/messages.png" /><span>Messages</span></a></li>	<li><a href="${BASE}/${PREFIX}/assets"><img alt="Files" src="${BASE}/img/switcher/files.png" /><span>Files</span></a></li>	<li><a href="${BASE}/${PREFIX}/settings"><img alt="Settings" src="${BASE}/img/switcher/settings.png" /><span>Settings</span></a></li></ul>';
jQuery.jlm.templates['layouts'] = [];
jQuery.jlm.templates['layouts']['default'] = '<h1>jQuery Light MVC framework</h1><ul>    <li><a class="index-link" href="#pages">Pages::index</a></li>    <li><a class="home-link" href="#pages.home">Pages::home</a></li>    <li><a href="./contact.html">Contact</a></li></ul><hr /><div id="content">    ${content_for_layout}</div>';
jQuery.jlm.templates['pages'] = [];
jQuery.jlm.templates['pages']['new_page'] = '<div id="name-new-page" class="new-dialog">    <h2 class="section">Create a new page</h2>        <form action="${action}" method="post">        <fieldset style="display:none">            <input type="hidden" name="_method" value="POST" />        </fieldset>        <div class="input title_input">            <label for="NewPageTitle">Page title</label>            <input id="NewPageTitle" type="text" size="60" name="data[Page][title]" maxlength="256" />        </div>                <div class="input select">            ${parentPageOptions}            <div>If you want to organize pages into a hierarchy, you can do so by selecting a parent page.</div>        </div>                <div class="submit wf-form-button">            <input type="submit" value="Create this page" />        </div>        <div class="cancel-edit"> or <a href="#Cancel">Cancel</a></div>    </form>    </div>';
jQuery.jlm.templates['posts'] = [];
jQuery.jlm.templates['posts']['new_post'] = '<div id="name-new-post" class="new-dialog">    <h2 class="section">Create a new post</h2>        <form action="${action}" method="post">        <fieldset style="display:none;">            <input type="hidden" name="_method" value="POST" />        </fieldset>        <div class="input title_input">            <label for="PostTitle">Post Title</label>            <input id="PostTitle" type="text" size="60" name="data[Post][title]" maxlength="256" />        </div>        <div class="submit wf-form-button">            <input type="submit" value="Create this post" />        </div>        <div class="cancel-edit"> or <a href="#Cancel">Cancel</a></div>    </form>    </div>';

/*
 * jQuery UI 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 */
;jQuery.ui || (function($) {

var _remove = $.fn.remove,
	isFF2 = $.browser.mozilla && (parseFloat($.browser.version) < 1.9);

//Helper functions and ui object
$.ui = {
	version: "1.7.1",

	// $.ui.plugin is deprecated.  Use the proxy pattern instead.
	plugin: {
		add: function(module, option, set) {
			var proto = $.ui[module].prototype;
			for(var i in set) {
				proto.plugins[i] = proto.plugins[i] || [];
				proto.plugins[i].push([option, set[i]]);
			}
		},
		call: function(instance, name, args) {
			var set = instance.plugins[name];
			if(!set || !instance.element[0].parentNode) { return; }

			for (var i = 0; i < set.length; i++) {
				if (instance.options[set[i][0]]) {
					set[i][1].apply(instance.element, args);
				}
			}
		}
	},

	contains: function(a, b) {
		return document.compareDocumentPosition
			? a.compareDocumentPosition(b) & 16
			: a !== b && a.contains(b);
	},

	hasScroll: function(el, a) {

		//If overflow is hidden, the element might have extra content, but the user wants to hide it
		if ($(el).css('overflow') == 'hidden') { return false; }

		var scroll = (a && a == 'left') ? 'scrollLeft' : 'scrollTop',
			has = false;

		if (el[scroll] > 0) { return true; }

		// TODO: determine which cases actually cause this to happen
		// if the element doesn't have the scroll set, see if it's possible to
		// set the scroll
		el[scroll] = 1;
		has = (el[scroll] > 0);
		el[scroll] = 0;
		return has;
	},

	isOverAxis: function(x, reference, size) {
		//Determines when x coordinate is over "b" element axis
		return (x > reference) && (x < (reference + size));
	},

	isOver: function(y, x, top, left, height, width) {
		//Determines when x, y coordinates is over "b" element
		return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
	},

	keyCode: {
		BACKSPACE: 8,
		CAPS_LOCK: 20,
		COMMA: 188,
		CONTROL: 17,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		INSERT: 45,
		LEFT: 37,
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
};

// WAI-ARIA normalization
if (isFF2) {
	var attr = $.attr,
		removeAttr = $.fn.removeAttr,
		ariaNS = "http://www.w3.org/2005/07/aaa",
		ariaState = /^aria-/,
		ariaRole = /^wairole:/;

	$.attr = function(elem, name, value) {
		var set = value !== undefined;

		return (name == 'role'
			? (set
				? attr.call(this, elem, name, "wairole:" + value)
				: (attr.apply(this, arguments) || "").replace(ariaRole, ""))
			: (ariaState.test(name)
				? (set
					? elem.setAttributeNS(ariaNS,
						name.replace(ariaState, "aaa:"), value)
					: attr.call(this, elem, name.replace(ariaState, "aaa:")))
				: attr.apply(this, arguments)));
	};

	$.fn.removeAttr = function(name) {
		return (ariaState.test(name)
			? this.each(function() {
				this.removeAttributeNS(ariaNS, name.replace(ariaState, ""));
			}) : removeAttr.call(this, name));
	};
}

//jQuery plugins
$.fn.extend({
	remove: function() {
		// Safari has a native remove event which actually removes DOM elements,
		// so we have to use triggerHandler instead of trigger (#3037).
		$("*", this).add(this).each(function() {
			$(this).triggerHandler("remove");
		});
		return _remove.apply(this, arguments );
	},

	enableSelection: function() {
		return this
			.attr('unselectable', 'off')
			.css('MozUserSelect', '')
			.unbind('selectstart.ui');
	},

	disableSelection: function() {
		return this
			.attr('unselectable', 'on')
			.css('MozUserSelect', 'none')
			.bind('selectstart.ui', function() { return false; });
	},

	scrollParent: function() {
		var scrollParent;
		if(($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
			scrollParent = this.parents().filter(function() {
				return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		} else {
			scrollParent = this.parents().filter(function() {
				return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
			}).eq(0);
		}

		return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
	}
});


//Additional selectors
$.extend($.expr[':'], {
	data: function(elem, i, match) {
		return !!$.data(elem, match[3]);
	},

	focusable: function(element) {
		var nodeName = element.nodeName.toLowerCase(),
			tabIndex = $.attr(element, 'tabindex');
		return (/input|select|textarea|button|object/.test(nodeName)
			? !element.disabled
			: 'a' == nodeName || 'area' == nodeName
				? element.href || !isNaN(tabIndex)
				: !isNaN(tabIndex))
			// the element and all of its ancestors must be visible
			// the browser may report that the area is hidden
			&& !$(element)['area' == nodeName ? 'parents' : 'closest'](':hidden').length;
	},

	tabbable: function(element) {
		var tabIndex = $.attr(element, 'tabindex');
		return (isNaN(tabIndex) || tabIndex >= 0) && $(element).is(':focusable');
	}
});


// $.widget is a factory to create jQuery plugins
// taking some boilerplate code out of the plugin code
function getter(namespace, plugin, method, args) {
	function getMethods(type) {
		var methods = $[namespace][plugin][type] || [];
		return (typeof methods == 'string' ? methods.split(/,?\s+/) : methods);
	}

	var methods = getMethods('getter');
	if (args.length == 1 && typeof args[0] == 'string') {
		methods = methods.concat(getMethods('getterSetter'));
	}
	return ($.inArray(method, methods) != -1);
}

$.widget = function(name, prototype) {
	var namespace = name.split(".")[0];
	name = name.split(".")[1];

	// create plugin method
	$.fn[name] = function(options) {
		var isMethodCall = (typeof options == 'string'),
			args = Array.prototype.slice.call(arguments, 1);

		// prevent calls to internal methods
		if (isMethodCall && options.substring(0, 1) == '_') {
			return this;
		}

		// handle getter methods
		if (isMethodCall && getter(namespace, name, options, args)) {
			var instance = $.data(this[0], name);
			return (instance ? instance[options].apply(instance, args)
				: undefined);
		}

		// handle initialization and non-getter methods
		return this.each(function() {
			var instance = $.data(this, name);

			// constructor
			(!instance && !isMethodCall &&
				$.data(this, name, new $[namespace][name](this, options))._init());

			// method call
			(instance && isMethodCall && $.isFunction(instance[options]) &&
				instance[options].apply(instance, args));
		});
	};

	// create widget constructor
	$[namespace] = $[namespace] || {};
	$[namespace][name] = function(element, options) {
		var self = this;

		this.namespace = namespace;
		this.widgetName = name;
		this.widgetEventPrefix = $[namespace][name].eventPrefix || name;
		this.widgetBaseClass = namespace + '-' + name;

		this.options = $.extend({},
			$.widget.defaults,
			$[namespace][name].defaults,
			$.metadata && $.metadata.get(element)[name],
			options);

		this.element = $(element)
			.bind('setData.' + name, function(event, key, value) {
				if (event.target == element) {
					return self._setData(key, value);
				}
			})
			.bind('getData.' + name, function(event, key) {
				if (event.target == element) {
					return self._getData(key);
				}
			})
			.bind('remove', function() {
				return self.destroy();
			});
	};

	// add widget prototype
	$[namespace][name].prototype = $.extend({}, $.widget.prototype, prototype);

	// TODO: merge getter and getterSetter properties from widget prototype
	// and plugin prototype
	$[namespace][name].getterSetter = 'option';
};

$.widget.prototype = {
	_init: function() {},
	destroy: function() {
		this.element.removeData(this.widgetName)
			.removeClass(this.widgetBaseClass + '-disabled' + ' ' + this.namespace + '-state-disabled')
			.removeAttr('aria-disabled');
	},

	option: function(key, value) {
		var options = key,
			self = this;

		if (typeof key == "string") {
			if (value === undefined) {
				return this._getData(key);
			}
			options = {};
			options[key] = value;
		}

		$.each(options, function(key, value) {
			self._setData(key, value);
		});
	},
	_getData: function(key) {
		return this.options[key];
	},
	_setData: function(key, value) {
		this.options[key] = value;

		if (key == 'disabled') {
			this.element
				[value ? 'addClass' : 'removeClass'](
					this.widgetBaseClass + '-disabled' + ' ' +
					this.namespace + '-state-disabled')
				.attr("aria-disabled", value);
		}
	},

	enable: function() {
		this._setData('disabled', false);
	},
	disable: function() {
		this._setData('disabled', true);
	},

	_trigger: function(type, event, data) {
		var callback = this.options[type],
			eventName = (type == this.widgetEventPrefix
				? type : this.widgetEventPrefix + type);

		event = $.Event(event);
		event.type = eventName;

		// copy original event properties over to the new event
		// this would happen if we could call $.event.fix instead of $.Event
		// but we don't have a way to force an event to be fixed multiple times
		if (event.originalEvent) {
			for (var i = $.event.props.length, prop; i;) {
				prop = $.event.props[--i];
				event[prop] = event.originalEvent[prop];
			}
		}

		this.element.trigger(event, data);

		return !($.isFunction(callback) && callback.call(this.element[0], event, data) === false
			|| event.isDefaultPrevented());
	}
};

$.widget.defaults = {
	disabled: false
};


/** Mouse Interaction Plugin **/

$.ui.mouse = {
	_mouseInit: function() {
		var self = this;

		this.element
			.bind('mousedown.'+this.widgetName, function(event) {
				return self._mouseDown(event);
			})
			.bind('click.'+this.widgetName, function(event) {
				if(self._preventClickEvent) {
					self._preventClickEvent = false;
					event.stopImmediatePropagation();
					return false;
				}
			});

		// Prevent text selection in IE
		if ($.browser.msie) {
			this._mouseUnselectable = this.element.attr('unselectable');
			this.element.attr('unselectable', 'on');
		}

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind('.'+this.widgetName);

		// Restore text selection in IE
		($.browser.msie
			&& this.element.attr('unselectable', this._mouseUnselectable));
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		// TODO: figure out why we have to use originalEvent
		event.originalEvent = event.originalEvent || {};
		if (event.originalEvent.mouseHandled) { return; }

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var self = this,
			btnIsLeft = (event.which == 1),
			elIsCancel = (typeof this.options.cancel == "string" ? $(event.target).parents().add(event.target).filter(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				self.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return self._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return self._mouseUp(event);
		};
		$(document)
			.bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.bind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		// preventDefault() is used to prevent the selection of text here -
		// however, in Safari, this causes select boxes not to be selectable
		// anymore, so this fix is needed
		($.browser.safari || event.preventDefault());

		event.originalEvent.mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.browser.msie && !event.button) {
			return this._mouseUp(event);
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		$(document)
			.unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
			.unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);

		if (this._mouseStarted) {
			this._mouseStarted = false;
			this._preventClickEvent = (event.target == this._mouseDownEvent.target);
			this._mouseStop(event);
		}

		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(event) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(event) {},
	_mouseDrag: function(event) {},
	_mouseStop: function(event) {},
	_mouseCapture: function(event) { return true; }
};

$.ui.mouse.defaults = {
	cancel: null,
	distance: 1,
	delay: 0
};

})(jQuery);
/*
 * jQuery UI Draggable 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Draggables
 *
 * Depends:
 *	ui.core.js
 */
(function($) {

$.widget("ui.draggable", $.extend({}, $.ui.mouse, {

	_init: function() {

		if (this.options.helper == 'original' && !(/^(?:r|a|f)/).test(this.element.css("position")))
			this.element[0].style.position = 'relative';

		(this.options.addClasses && this.element.addClass("ui-draggable"));
		(this.options.disabled && this.element.addClass("ui-draggable-disabled"));

		this._mouseInit();

	},

	destroy: function() {
		if(!this.element.data('draggable')) return;
		this.element
			.removeData("draggable")
			.unbind(".draggable")
			.removeClass("ui-draggable"
				+ " ui-draggable-dragging"
				+ " ui-draggable-disabled");
		this._mouseDestroy();
	},

	_mouseCapture: function(event) {

		var o = this.options;

		if (this.helper || o.disabled || $(event.target).is('.ui-resizable-handle'))
			return false;

		//Quit if we're not on a valid handle
		this.handle = this._getHandle(event);
		if (!this.handle)
			return false;

		return true;

	},

	_mouseStart: function(event) {

		var o = this.options;

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		//If ddmanager is used for droppables, set the global draggable
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Store the helper's css position
		this.cssPosition = this.helper.css("position");
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.element.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		if(o.cursorAt)
			this._adjustOffsetFromHelper(o.cursorAt);

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		//Call plugins and callbacks
		this._trigger("start", event);

		//Recache the helper size
		this._cacheHelperProportions();

		//Prepare the droppable offsets
		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);

		this.helper.addClass("ui-draggable-dragging");
		this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;
	},

	_mouseDrag: function(event, noPropagation) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		//Call plugins and callbacks and use the resulting position if something is returned
		if (!noPropagation) {
			var ui = this._uiHash();
			this._trigger('drag', event, ui);
			this.position = ui.position;
		}

		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		return false;
	},

	_mouseStop: function(event) {

		//If we are using droppables, inform the manager about the drop
		var dropped = false;
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			dropped = $.ui.ddmanager.drop(this, event);

		//if a drop comes from outside (a sortable)
		if(this.dropped) {
			dropped = this.dropped;
			this.dropped = false;
		}

		if((this.options.revert == "invalid" && !dropped) || (this.options.revert == "valid" && dropped) || this.options.revert === true || ($.isFunction(this.options.revert) && this.options.revert.call(this.element, dropped))) {
			var self = this;
			$(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function() {
				self._trigger("stop", event);
				self._clear();
			});
		} else {
			this._trigger("stop", event);
			this._clear();
		}

		return false;
	},

	_getHandle: function(event) {

		var handle = !this.options.handle || !$(this.options.handle, this.element).length ? true : false;
		$(this.options.handle, this.element)
			.find("*")
			.andSelf()
			.each(function() {
				if(this == event.target) handle = true;
			});

		return handle;

	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event])) : (o.helper == 'clone' ? this.element.clone() : this.element);

		if(!helper.parents('body').length)
			helper.appendTo((o.appendTo == 'parent' ? this.element[0].parentNode : o.appendTo));

		if(helper[0] != this.element[0] && !(/(fixed|absolute)/).test(helper.css("position")))
			helper.css("position", "absolute");

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if(obj.left != undefined) this.offset.click.left = obj.left + this.margins.left;
		if(obj.right != undefined) this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		if(obj.top != undefined) this.offset.click.top = obj.top + this.margins.top;
		if(obj.bottom != undefined) this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
	},

	_getParentOffset: function() {

		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.element.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.element.css("marginLeft"),10) || 0),
			top: (parseInt(this.element.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			0 - this.offset.relative.left - this.offset.parent.left,
			0 - this.offset.relative.top - this.offset.parent.top,
			$(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment) && o.containment.constructor != Array) {
			var ce = $(o.containment)[0]; if(!ce) return;
			var co = $(o.containment).offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		} else if(o.containment.constructor == Array) {
			this.containment = o.containment;
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_clear: function() {
		this.helper.removeClass("ui-draggable-dragging");
		if(this.helper[0] != this.element[0] && !this.cancelHelperRemoval) this.helper.remove();
		//if($.ui.ddmanager) $.ui.ddmanager.current = null;
		this.helper = null;
		this.cancelHelperRemoval = false;
	},

	// From now on bulk stuff - mainly helpers

	_trigger: function(type, event, ui) {
		ui = ui || this._uiHash();
		$.ui.plugin.call(this, type, [event, ui]);
		if(type == "drag") this.positionAbs = this._convertPositionTo("absolute"); //The absolute position has to be recalculated after plugins
		return $.widget.prototype._trigger.call(this, type, event, ui);
	},

	plugins: {},

	_uiHash: function(event) {
		return {
			helper: this.helper,
			position: this.position,
			absolutePosition: this.positionAbs, //deprecated
			offset: this.positionAbs
		};
	}

}));

$.extend($.ui.draggable, {
	version: "1.7.1",
	eventPrefix: "drag",
	defaults: {
		addClasses: true,
		appendTo: "parent",
		axis: false,
		cancel: ":input,option",
		connectToSortable: false,
		containment: false,
		cursor: "auto",
		cursorAt: false,
		delay: 0,
		distance: 1,
		grid: false,
		handle: false,
		helper: "original",
		iframeFix: false,
		opacity: false,
		refreshPositions: false,
		revert: false,
		revertDuration: 500,
		scope: "default",
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		snap: false,
		snapMode: "both",
		snapTolerance: 20,
		stack: false,
		zIndex: false
	}
});

$.ui.plugin.add("draggable", "connectToSortable", {
	start: function(event, ui) {

		var inst = $(this).data("draggable"), o = inst.options,
			uiSortable = $.extend({}, ui, { item: inst.element });
		inst.sortables = [];
		$(o.connectToSortable).each(function() {
			var sortable = $.data(this, 'sortable');
			if (sortable && !sortable.options.disabled) {
				inst.sortables.push({
					instance: sortable,
					shouldRevert: sortable.options.revert
				});
				sortable._refreshItems();	//Do a one-time refresh at start to refresh the containerCache
				sortable._trigger("activate", event, uiSortable);
			}
		});

	},
	stop: function(event, ui) {

		//If we are still over the sortable, we fake the stop event of the sortable, but also remove helper
		var inst = $(this).data("draggable"),
			uiSortable = $.extend({}, ui, { item: inst.element });

		$.each(inst.sortables, function() {
			if(this.instance.isOver) {

				this.instance.isOver = 0;

				inst.cancelHelperRemoval = true; //Don't remove the helper in the draggable instance
				this.instance.cancelHelperRemoval = false; //Remove it in the sortable instance (so sortable plugins like revert still work)

				//The sortable revert is supported, and we have to set a temporary dropped variable on the draggable to support revert: 'valid/invalid'
				if(this.shouldRevert) this.instance.options.revert = true;

				//Trigger the stop of the sortable
				this.instance._mouseStop(event);

				this.instance.options.helper = this.instance.options._helper;

				//If the helper has been the original item, restore properties in the sortable
				if(inst.options.helper == 'original')
					this.instance.currentItem.css({ top: 'auto', left: 'auto' });

			} else {
				this.instance.cancelHelperRemoval = false; //Remove the helper in the sortable instance
				this.instance._trigger("deactivate", event, uiSortable);
			}

		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("draggable"), self = this;

		var checkPos = function(o) {
			var dyClick = this.offset.click.top, dxClick = this.offset.click.left;
			var helperTop = this.positionAbs.top, helperLeft = this.positionAbs.left;
			var itemHeight = o.height, itemWidth = o.width;
			var itemTop = o.top, itemLeft = o.left;

			return $.ui.isOver(helperTop + dyClick, helperLeft + dxClick, itemTop, itemLeft, itemHeight, itemWidth);
		};

		$.each(inst.sortables, function(i) {
			
			//Copy over some variables to allow calling the sortable's native _intersectsWith
			this.instance.positionAbs = inst.positionAbs;
			this.instance.helperProportions = inst.helperProportions;
			this.instance.offset.click = inst.offset.click;
			
			if(this.instance._intersectsWith(this.instance.containerCache)) {

				//If it intersects, we use a little isOver variable and set it once, so our move-in stuff gets fired only once
				if(!this.instance.isOver) {

					this.instance.isOver = 1;
					//Now we fake the start of dragging for the sortable instance,
					//by cloning the list group item, appending it to the sortable and using it as inst.currentItem
					//We can then fire the start event of the sortable with our passed browser event, and our own helper (so it doesn't create a new one)
					this.instance.currentItem = $(self).clone().appendTo(this.instance.element).data("sortable-item", true);
					this.instance.options._helper = this.instance.options.helper; //Store helper option to later restore it
					this.instance.options.helper = function() { return ui.helper[0]; };

					event.target = this.instance.currentItem[0];
					this.instance._mouseCapture(event, true);
					this.instance._mouseStart(event, true, true);

					//Because the browser event is way off the new appended portlet, we modify a couple of variables to reflect the changes
					this.instance.offset.click.top = inst.offset.click.top;
					this.instance.offset.click.left = inst.offset.click.left;
					this.instance.offset.parent.left -= inst.offset.parent.left - this.instance.offset.parent.left;
					this.instance.offset.parent.top -= inst.offset.parent.top - this.instance.offset.parent.top;

					inst._trigger("toSortable", event);
					inst.dropped = this.instance.element; //draggable revert needs that
					//hack so receive/update callbacks work (mostly)
					inst.currentItem = inst.element;
					this.instance.fromOutside = inst;

				}

				//Provided we did all the previous steps, we can fire the drag event of the sortable on every draggable drag, when it intersects with the sortable
				if(this.instance.currentItem) this.instance._mouseDrag(event);

			} else {

				//If it doesn't intersect with the sortable, and it intersected before,
				//we fake the drag stop of the sortable, but make sure it doesn't remove the helper by using cancelHelperRemoval
				if(this.instance.isOver) {

					this.instance.isOver = 0;
					this.instance.cancelHelperRemoval = true;
					
					//Prevent reverting on this forced stop
					this.instance.options.revert = false;
					
					// The out event needs to be triggered independently
					this.instance._trigger('out', event, this.instance._uiHash(this.instance));
					
					this.instance._mouseStop(event, true);
					this.instance.options.helper = this.instance.options._helper;

					//Now we remove our currentItem, the list group clone again, and the placeholder, and animate the helper back to it's original size
					this.instance.currentItem.remove();
					if(this.instance.placeholder) this.instance.placeholder.remove();

					inst._trigger("fromSortable", event);
					inst.dropped = false; //draggable revert needs that
				}

			};

		});

	}
});

$.ui.plugin.add("draggable", "cursor", {
	start: function(event, ui) {
		var t = $('body'), o = $(this).data('draggable').options;
		if (t.css("cursor")) o._cursor = t.css("cursor");
		t.css("cursor", o.cursor);
	},
	stop: function(event, ui) {
		var o = $(this).data('draggable').options;
		if (o._cursor) $('body').css("cursor", o._cursor);
	}
});

$.ui.plugin.add("draggable", "iframeFix", {
	start: function(event, ui) {
		var o = $(this).data('draggable').options;
		$(o.iframeFix === true ? "iframe" : o.iframeFix).each(function() {
			$('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>')
			.css({
				width: this.offsetWidth+"px", height: this.offsetHeight+"px",
				position: "absolute", opacity: "0.001", zIndex: 1000
			})
			.css($(this).offset())
			.appendTo("body");
		});
	},
	stop: function(event, ui) {
		$("div.ui-draggable-iframeFix").each(function() { this.parentNode.removeChild(this); }); //Remove frame helpers
	}
});

$.ui.plugin.add("draggable", "opacity", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data('draggable').options;
		if(t.css("opacity")) o._opacity = t.css("opacity");
		t.css('opacity', o.opacity);
	},
	stop: function(event, ui) {
		var o = $(this).data('draggable').options;
		if(o._opacity) $(ui.helper).css('opacity', o._opacity);
	}
});

$.ui.plugin.add("draggable", "scroll", {
	start: function(event, ui) {
		var i = $(this).data("draggable");
		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') i.overflowOffset = i.scrollParent.offset();
	},
	drag: function(event, ui) {

		var i = $(this).data("draggable"), o = i.options, scrolled = false;

		if(i.scrollParent[0] != document && i.scrollParent[0].tagName != 'HTML') {

			if(!o.axis || o.axis != 'x') {
				if((i.overflowOffset.top + i.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - i.overflowOffset.top < o.scrollSensitivity)
					i.scrollParent[0].scrollTop = scrolled = i.scrollParent[0].scrollTop - o.scrollSpeed;
			}

			if(!o.axis || o.axis != 'y') {
				if((i.overflowOffset.left + i.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - i.overflowOffset.left < o.scrollSensitivity)
					i.scrollParent[0].scrollLeft = scrolled = i.scrollParent[0].scrollLeft - o.scrollSpeed;
			}

		} else {

			if(!o.axis || o.axis != 'x') {
				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);
			}

			if(!o.axis || o.axis != 'y') {
				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);
			}

		}

		if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(i, event);

	}
});

$.ui.plugin.add("draggable", "snap", {
	start: function(event, ui) {

		var i = $(this).data("draggable"), o = i.options;
		i.snapElements = [];

		$(o.snap.constructor != String ? ( o.snap.items || ':data(draggable)' ) : o.snap).each(function() {
			var $t = $(this); var $o = $t.offset();
			if(this != i.element[0]) i.snapElements.push({
				item: this,
				width: $t.outerWidth(), height: $t.outerHeight(),
				top: $o.top, left: $o.left
			});
		});

	},
	drag: function(event, ui) {

		var inst = $(this).data("draggable"), o = inst.options;
		var d = o.snapTolerance;

		var x1 = ui.offset.left, x2 = x1 + inst.helperProportions.width,
			y1 = ui.offset.top, y2 = y1 + inst.helperProportions.height;

		for (var i = inst.snapElements.length - 1; i >= 0; i--){

			var l = inst.snapElements[i].left, r = l + inst.snapElements[i].width,
				t = inst.snapElements[i].top, b = t + inst.snapElements[i].height;

			//Yes, I know, this is insane ;)
			if(!((l-d < x1 && x1 < r+d && t-d < y1 && y1 < b+d) || (l-d < x1 && x1 < r+d && t-d < y2 && y2 < b+d) || (l-d < x2 && x2 < r+d && t-d < y1 && y1 < b+d) || (l-d < x2 && x2 < r+d && t-d < y2 && y2 < b+d))) {
				if(inst.snapElements[i].snapping) (inst.options.snap.release && inst.options.snap.release.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
				inst.snapElements[i].snapping = false;
				continue;
			}

			if(o.snapMode != 'inner') {
				var ts = Math.abs(t - y2) <= d;
				var bs = Math.abs(b - y1) <= d;
				var ls = Math.abs(l - x2) <= d;
				var rs = Math.abs(r - x1) <= d;
				if(ts) ui.position.top = inst._convertPositionTo("relative", { top: t - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				if(bs) ui.position.top = inst._convertPositionTo("relative", { top: b, left: 0 }).top - inst.margins.top;
				if(ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l - inst.helperProportions.width }).left - inst.margins.left;
				if(rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r }).left - inst.margins.left;
			}

			var first = (ts || bs || ls || rs);

			if(o.snapMode != 'outer') {
				var ts = Math.abs(t - y1) <= d;
				var bs = Math.abs(b - y2) <= d;
				var ls = Math.abs(l - x1) <= d;
				var rs = Math.abs(r - x2) <= d;
				if(ts) ui.position.top = inst._convertPositionTo("relative", { top: t, left: 0 }).top - inst.margins.top;
				if(bs) ui.position.top = inst._convertPositionTo("relative", { top: b - inst.helperProportions.height, left: 0 }).top - inst.margins.top;
				if(ls) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: l }).left - inst.margins.left;
				if(rs) ui.position.left = inst._convertPositionTo("relative", { top: 0, left: r - inst.helperProportions.width }).left - inst.margins.left;
			}

			if(!inst.snapElements[i].snapping && (ts || bs || ls || rs || first))
				(inst.options.snap.snap && inst.options.snap.snap.call(inst.element, event, $.extend(inst._uiHash(), { snapItem: inst.snapElements[i].item })));
			inst.snapElements[i].snapping = (ts || bs || ls || rs || first);

		};

	}
});

$.ui.plugin.add("draggable", "stack", {
	start: function(event, ui) {

		var o = $(this).data("draggable").options;

		var group = $.makeArray($(o.stack.group)).sort(function(a,b) {
			return (parseInt($(a).css("zIndex"),10) || o.stack.min) - (parseInt($(b).css("zIndex"),10) || o.stack.min);
		});

		$(group).each(function(i) {
			this.style.zIndex = o.stack.min + i;
		});

		this[0].style.zIndex = o.stack.min + group.length;

	}
});

$.ui.plugin.add("draggable", "zIndex", {
	start: function(event, ui) {
		var t = $(ui.helper), o = $(this).data("draggable").options;
		if(t.css("zIndex")) o._zIndex = t.css("zIndex");
		t.css('zIndex', o.zIndex);
	},
	stop: function(event, ui) {
		var o = $(this).data("draggable").options;
		if(o._zIndex) $(ui.helper).css('zIndex', o._zIndex);
	}
});

})(jQuery);
/*
 * jQuery UI Droppable 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Droppables
 *
 * Depends:
 *	ui.core.js
 *	ui.draggable.js
 */
(function($) {

$.widget("ui.droppable", {

	_init: function() {

		var o = this.options, accept = o.accept;
		this.isover = 0; this.isout = 1;

		this.options.accept = this.options.accept && $.isFunction(this.options.accept) ? this.options.accept : function(d) {
			return d.is(accept);
		};

		//Store the droppable's proportions
		this.proportions = { width: this.element[0].offsetWidth, height: this.element[0].offsetHeight };

		// Add the reference and positions to the manager
		$.ui.ddmanager.droppables[this.options.scope] = $.ui.ddmanager.droppables[this.options.scope] || [];
		$.ui.ddmanager.droppables[this.options.scope].push(this);

		(this.options.addClasses && this.element.addClass("ui-droppable"));

	},

	destroy: function() {
		var drop = $.ui.ddmanager.droppables[this.options.scope];
		for ( var i = 0; i < drop.length; i++ )
			if ( drop[i] == this )
				drop.splice(i, 1);

		this.element
			.removeClass("ui-droppable ui-droppable-disabled")
			.removeData("droppable")
			.unbind(".droppable");
	},

	_setData: function(key, value) {

		if(key == 'accept') {
			this.options.accept = value && $.isFunction(value) ? value : function(d) {
				return d.is(value);
			};
		} else {
			$.widget.prototype._setData.apply(this, arguments);
		}

	},

	_activate: function(event) {
		var draggable = $.ui.ddmanager.current;
		if(this.options.activeClass) this.element.addClass(this.options.activeClass);
		(draggable && this._trigger('activate', event, this.ui(draggable)));
	},

	_deactivate: function(event) {
		var draggable = $.ui.ddmanager.current;
		if(this.options.activeClass) this.element.removeClass(this.options.activeClass);
		(draggable && this._trigger('deactivate', event, this.ui(draggable)));
	},

	_over: function(event) {

		var draggable = $.ui.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return; // Bail if draggable and droppable are same element

		if (this.options.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) this.element.addClass(this.options.hoverClass);
			this._trigger('over', event, this.ui(draggable));
		}

	},

	_out: function(event) {

		var draggable = $.ui.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return; // Bail if draggable and droppable are same element

		if (this.options.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.hoverClass) this.element.removeClass(this.options.hoverClass);
			this._trigger('out', event, this.ui(draggable));
		}

	},

	_drop: function(event,custom) {

		var draggable = custom || $.ui.ddmanager.current;
		if (!draggable || (draggable.currentItem || draggable.element)[0] == this.element[0]) return false; // Bail if draggable and droppable are same element

		var childrenIntersection = false;
		this.element.find(":data(droppable)").not(".ui-draggable-dragging").each(function() {
			var inst = $.data(this, 'droppable');
			if(inst.options.greedy && $.ui.intersect(draggable, $.extend(inst, { offset: inst.element.offset() }), inst.options.tolerance)) {
				childrenIntersection = true; return false;
			}
		});
		if(childrenIntersection) return false;

		if(this.options.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
			if(this.options.activeClass) this.element.removeClass(this.options.activeClass);
			if(this.options.hoverClass) this.element.removeClass(this.options.hoverClass);
			this._trigger('drop', event, this.ui(draggable));
			return this.element;
		}

		return false;

	},

	ui: function(c) {
		return {
			draggable: (c.currentItem || c.element),
			helper: c.helper,
			position: c.position,
			absolutePosition: c.positionAbs, //deprecated
			offset: c.positionAbs
		};
	}

});

$.extend($.ui.droppable, {
	version: "1.7.1",
	eventPrefix: 'drop',
	defaults: {
		accept: '*',
		activeClass: false,
		addClasses: true,
		greedy: false,
		hoverClass: false,
		scope: 'default',
		tolerance: 'intersect'
	}
});

$.ui.intersect = function(draggable, droppable, toleranceMode) {

	if (!droppable.offset) return false;

	var x1 = (draggable.positionAbs || draggable.position.absolute).left, x2 = x1 + draggable.helperProportions.width,
		y1 = (draggable.positionAbs || draggable.position.absolute).top, y2 = y1 + draggable.helperProportions.height;
	var l = droppable.offset.left, r = l + droppable.proportions.width,
		t = droppable.offset.top, b = t + droppable.proportions.height;

	switch (toleranceMode) {
		case 'fit':
			return (l < x1 && x2 < r
				&& t < y1 && y2 < b);
			break;
		case 'intersect':
			return (l < x1 + (draggable.helperProportions.width / 2) // Right Half
				&& x2 - (draggable.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (draggable.helperProportions.height / 2) // Bottom Half
				&& y2 - (draggable.helperProportions.height / 2) < b ); // Top Half
			break;
		case 'pointer':
			var draggableLeft = ((draggable.positionAbs || draggable.position.absolute).left + (draggable.clickOffset || draggable.offset.click).left),
				draggableTop = ((draggable.positionAbs || draggable.position.absolute).top + (draggable.clickOffset || draggable.offset.click).top),
				isOver = $.ui.isOver(draggableTop, draggableLeft, t, l, droppable.proportions.height, droppable.proportions.width);
			return isOver;
			break;
		case 'touch':
			return (
					(y1 >= t && y1 <= b) ||	// Top edge touching
					(y2 >= t && y2 <= b) ||	// Bottom edge touching
					(y1 < t && y2 > b)		// Surrounded vertically
				) && (
					(x1 >= l && x1 <= r) ||	// Left edge touching
					(x2 >= l && x2 <= r) ||	// Right edge touching
					(x1 < l && x2 > r)		// Surrounded horizontally
				);
			break;
		default:
			return false;
			break;
		}

};

/*
	This manager tracks offsets of draggables and droppables
*/
$.ui.ddmanager = {
	current: null,
	droppables: { 'default': [] },
	prepareOffsets: function(t, event) {

		var m = $.ui.ddmanager.droppables[t.options.scope];
		var type = event ? event.type : null; // workaround for #2317
		var list = (t.currentItem || t.element).find(":data(droppable)").andSelf();

		droppablesLoop: for (var i = 0; i < m.length; i++) {

			if(m[i].options.disabled || (t && !m[i].options.accept.call(m[i].element[0],(t.currentItem || t.element)))) continue;	//No disabled and non-accepted
			for (var j=0; j < list.length; j++) { if(list[j] == m[i].element[0]) { m[i].proportions.height = 0; continue droppablesLoop; } }; //Filter out elements in the current dragged item
			m[i].visible = m[i].element.css("display") != "none"; if(!m[i].visible) continue; 									//If the element is not visible, continue

			m[i].offset = m[i].element.offset();
			m[i].proportions = { width: m[i].element[0].offsetWidth, height: m[i].element[0].offsetHeight };

			if(type == "mousedown") m[i]._activate.call(m[i], event); //Activate the droppable if used directly from draggables

		}

	},
	drop: function(draggable, event) {

		var dropped = false;
		$.each($.ui.ddmanager.droppables[draggable.options.scope], function() {

			if(!this.options) return;
			if (!this.options.disabled && this.visible && $.ui.intersect(draggable, this, this.options.tolerance))
				dropped = this._drop.call(this, event);

			if (!this.options.disabled && this.visible && this.options.accept.call(this.element[0],(draggable.currentItem || draggable.element))) {
				this.isout = 1; this.isover = 0;
				this._deactivate.call(this, event);
			}

		});
		return dropped;

	},
	drag: function(draggable, event) {

		//If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
		if(draggable.options.refreshPositions) $.ui.ddmanager.prepareOffsets(draggable, event);

		//Run through all droppables and check their positions based on specific tolerance options

		$.each($.ui.ddmanager.droppables[draggable.options.scope], function() {

			if(this.options.disabled || this.greedyChild || !this.visible) return;
			var intersects = $.ui.intersect(draggable, this, this.options.tolerance);

			var c = !intersects && this.isover == 1 ? 'isout' : (intersects && this.isover == 0 ? 'isover' : null);
			if(!c) return;

			var parentInstance;
			if (this.options.greedy) {
				var parent = this.element.parents(':data(droppable):eq(0)');
				if (parent.length) {
					parentInstance = $.data(parent[0], 'droppable');
					parentInstance.greedyChild = (c == 'isover' ? 1 : 0);
				}
			}

			// we just moved into a greedy child
			if (parentInstance && c == 'isover') {
				parentInstance['isover'] = 0;
				parentInstance['isout'] = 1;
				parentInstance._out.call(parentInstance, event);
			}

			this[c] = 1; this[c == 'isout' ? 'isover' : 'isout'] = 0;
			this[c == "isover" ? "_over" : "_out"].call(this, event);

			// we just moved out of a greedy child
			if (parentInstance && c == 'isout') {
				parentInstance['isout'] = 0;
				parentInstance['isover'] = 1;
				parentInstance._over.call(parentInstance, event);
			}
		});

	}
};

})(jQuery);
/*
 * jQuery UI Resizable 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Resizables
 *
 * Depends:
 *	ui.core.js
 */
(function($) {

$.widget("ui.resizable", $.extend({}, $.ui.mouse, {

	_init: function() {

		var self = this, o = this.options;
		this.element.addClass("ui-resizable");

		$.extend(this, {
			_aspectRatio: !!(o.aspectRatio),
			aspectRatio: o.aspectRatio,
			originalElement: this.element,
			_proportionallyResizeElements: [],
			_helper: o.helper || o.ghost || o.animate ? o.helper || 'ui-resizable-helper' : null
		});

		//Wrap the element if it cannot hold child nodes
		if(this.element[0].nodeName.match(/canvas|textarea|input|select|button|img/i)) {

			//Opera fix for relative positioning
			if (/relative/.test(this.element.css('position')) && $.browser.opera)
				this.element.css({ position: 'relative', top: 'auto', left: 'auto' });

			//Create a wrapper element and set the wrapper to the new current internal element
			this.element.wrap(
				$('<div class="ui-wrapper" style="overflow: hidden;"></div>').css({
					position: this.element.css('position'),
					width: this.element.outerWidth(),
					height: this.element.outerHeight(),
					top: this.element.css('top'),
					left: this.element.css('left')
				})
			);

			//Overwrite the original this.element
			this.element = this.element.parent().data(
				"resizable", this.element.data('resizable')
			);

			this.elementIsWrapper = true;

			//Move margins to the wrapper
			this.element.css({ marginLeft: this.originalElement.css("marginLeft"), marginTop: this.originalElement.css("marginTop"), marginRight: this.originalElement.css("marginRight"), marginBottom: this.originalElement.css("marginBottom") });
			this.originalElement.css({ marginLeft: 0, marginTop: 0, marginRight: 0, marginBottom: 0});

			//Prevent Safari textarea resize
			this.originalResizeStyle = this.originalElement.css('resize');
			this.originalElement.css('resize', 'none');

			//Push the actual element to our proportionallyResize internal array
			this._proportionallyResizeElements.push(this.originalElement.css({ position: 'static', zoom: 1, display: 'block' }));

			// avoid IE jump (hard set the margin)
			this.originalElement.css({ margin: this.originalElement.css('margin') });

			// fix handlers offset
			this._proportionallyResize();

		}

		this.handles = o.handles || (!$('.ui-resizable-handle', this.element).length ? "e,s,se" : { n: '.ui-resizable-n', e: '.ui-resizable-e', s: '.ui-resizable-s', w: '.ui-resizable-w', se: '.ui-resizable-se', sw: '.ui-resizable-sw', ne: '.ui-resizable-ne', nw: '.ui-resizable-nw' });
		if(this.handles.constructor == String) {

			if(this.handles == 'all') this.handles = 'n,e,s,w,se,sw,ne,nw';
			var n = this.handles.split(","); this.handles = {};

			for(var i = 0; i < n.length; i++) {

				var handle = $.trim(n[i]), hname = 'ui-resizable-'+handle;
				var axis = $('<div class="ui-resizable-handle ' + hname + '"></div>');

				// increase zIndex of sw, se, ne, nw axis
				//TODO : this modifies original option
				if(/sw|se|ne|nw/.test(handle)) axis.css({ zIndex: ++o.zIndex });

				//TODO : What's going on here?
				if ('se' == handle) {
					axis.addClass('ui-icon ui-icon-gripsmall-diagonal-se');
				};

				//Insert into internal handles object and append to element
				this.handles[handle] = '.ui-resizable-'+handle;
				this.element.append(axis);
			}

		}

		this._renderAxis = function(target) {

			target = target || this.element;

			for(var i in this.handles) {

				if(this.handles[i].constructor == String)
					this.handles[i] = $(this.handles[i], this.element).show();

				//Apply pad to wrapper element, needed to fix axis position (textarea, inputs, scrolls)
				if (this.elementIsWrapper && this.originalElement[0].nodeName.match(/textarea|input|select|button/i)) {

					var axis = $(this.handles[i], this.element), padWrapper = 0;

					//Checking the correct pad and border
					padWrapper = /sw|ne|nw|se|n|s/.test(i) ? axis.outerHeight() : axis.outerWidth();

					//The padding type i have to apply...
					var padPos = [ 'padding',
						/ne|nw|n/.test(i) ? 'Top' :
						/se|sw|s/.test(i) ? 'Bottom' :
						/^e$/.test(i) ? 'Right' : 'Left' ].join("");

					target.css(padPos, padWrapper);

					this._proportionallyResize();

				}

				//TODO: What's that good for? There's not anything to be executed left
				if(!$(this.handles[i]).length)
					continue;

			}
		};

		//TODO: make renderAxis a prototype function
		this._renderAxis(this.element);

		this._handles = $('.ui-resizable-handle', this.element)
			.disableSelection();

		//Matching axis name
		this._handles.mouseover(function() {
			if (!self.resizing) {
				if (this.className)
					var axis = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);
				//Axis, default = se
				self.axis = axis && axis[1] ? axis[1] : 'se';
			}
		});

		//If we want to auto hide the elements
		if (o.autoHide) {
			this._handles.hide();
			$(this.element)
				.addClass("ui-resizable-autohide")
				.hover(function() {
					$(this).removeClass("ui-resizable-autohide");
					self._handles.show();
				},
				function(){
					if (!self.resizing) {
						$(this).addClass("ui-resizable-autohide");
						self._handles.hide();
					}
				});
		}

		//Initialize the mouse interaction
		this._mouseInit();

	},

	destroy: function() {

		this._mouseDestroy();

		var _destroy = function(exp) {
			$(exp).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing")
				.removeData("resizable").unbind(".resizable").find('.ui-resizable-handle').remove();
		};

		//TODO: Unwrap at same DOM position
		if (this.elementIsWrapper) {
			_destroy(this.element);
			var wrapper = this.element;
			wrapper.parent().append(
				this.originalElement.css({
					position: wrapper.css('position'),
					width: wrapper.outerWidth(),
					height: wrapper.outerHeight(),
					top: wrapper.css('top'),
					left: wrapper.css('left')
				})
			).end().remove();
		}

		this.originalElement.css('resize', this.originalResizeStyle);
		_destroy(this.originalElement);

	},

	_mouseCapture: function(event) {

		var handle = false;
		for(var i in this.handles) {
			if($(this.handles[i])[0] == event.target) handle = true;
		}

		return this.options.disabled || !!handle;

	},

	_mouseStart: function(event) {

		var o = this.options, iniPos = this.element.position(), el = this.element;

		this.resizing = true;
		this.documentScroll = { top: $(document).scrollTop(), left: $(document).scrollLeft() };

		// bugfix for http://dev.jquery.com/ticket/1749
		if (el.is('.ui-draggable') || (/absolute/).test(el.css('position'))) {
			el.css({ position: 'absolute', top: iniPos.top, left: iniPos.left });
		}

		//Opera fixing relative position
		if ($.browser.opera && (/relative/).test(el.css('position')))
			el.css({ position: 'relative', top: 'auto', left: 'auto' });

		this._renderProxy();

		var curleft = num(this.helper.css('left')), curtop = num(this.helper.css('top'));

		if (o.containment) {
			curleft += $(o.containment).scrollLeft() || 0;
			curtop += $(o.containment).scrollTop() || 0;
		}

		//Store needed variables
		this.offset = this.helper.offset();
		this.position = { left: curleft, top: curtop };
		this.size = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalSize = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalPosition = { left: curleft, top: curtop };
		this.sizeDiff = { width: el.outerWidth() - el.width(), height: el.outerHeight() - el.height() };
		this.originalMousePosition = { left: event.pageX, top: event.pageY };

		//Aspect Ratio
		this.aspectRatio = (typeof o.aspectRatio == 'number') ? o.aspectRatio : ((this.originalSize.width / this.originalSize.height) || 1);

	    var cursor = $('.ui-resizable-' + this.axis).css('cursor');
	    $('body').css('cursor', cursor == 'auto' ? this.axis + '-resize' : cursor);

		el.addClass("ui-resizable-resizing");
		this._propagate("start", event);
		return true;
	},

	_mouseDrag: function(event) {

		//Increase performance, avoid regex
		var el = this.helper, o = this.options, props = {},
			self = this, smp = this.originalMousePosition, a = this.axis;

		var dx = (event.pageX-smp.left)||0, dy = (event.pageY-smp.top)||0;
		var trigger = this._change[a];
		if (!trigger) return false;

		// Calculate the attrs that will be change
		var data = trigger.apply(this, [event, dx, dy]), ie6 = $.browser.msie && $.browser.version < 7, csdif = this.sizeDiff;

		if (this._aspectRatio || event.shiftKey)
			data = this._updateRatio(data, event);

		data = this._respectSize(data, event);

		// plugins callbacks need to be called first
		this._propagate("resize", event);

		el.css({
			top: this.position.top + "px", left: this.position.left + "px",
			width: this.size.width + "px", height: this.size.height + "px"
		});

		if (!this._helper && this._proportionallyResizeElements.length)
			this._proportionallyResize();

		this._updateCache(data);

		// calling the user callback at the end
		this._trigger('resize', event, this.ui());

		return false;
	},

	_mouseStop: function(event) {

		this.resizing = false;
		var o = this.options, self = this;

		if(this._helper) {
			var pr = this._proportionallyResizeElements, ista = pr.length && (/textarea/i).test(pr[0].nodeName),
						soffseth = ista && $.ui.hasScroll(pr[0], 'left') /* TODO - jump height */ ? 0 : self.sizeDiff.height,
							soffsetw = ista ? 0 : self.sizeDiff.width;

			var s = { width: (self.size.width - soffsetw), height: (self.size.height - soffseth) },
				left = (parseInt(self.element.css('left'), 10) + (self.position.left - self.originalPosition.left)) || null,
				top = (parseInt(self.element.css('top'), 10) + (self.position.top - self.originalPosition.top)) || null;

			if (!o.animate)
				this.element.css($.extend(s, { top: top, left: left }));

			self.helper.height(self.size.height);
			self.helper.width(self.size.width);

			if (this._helper && !o.animate) this._proportionallyResize();
		}

		$('body').css('cursor', 'auto');

		this.element.removeClass("ui-resizable-resizing");

		this._propagate("stop", event);

		if (this._helper) this.helper.remove();
		return false;

	},

	_updateCache: function(data) {
		var o = this.options;
		this.offset = this.helper.offset();
		if (isNumber(data.left)) this.position.left = data.left;
		if (isNumber(data.top)) this.position.top = data.top;
		if (isNumber(data.height)) this.size.height = data.height;
		if (isNumber(data.width)) this.size.width = data.width;
	},

	_updateRatio: function(data, event) {

		var o = this.options, cpos = this.position, csize = this.size, a = this.axis;

		if (data.height) data.width = (csize.height * this.aspectRatio);
		else if (data.width) data.height = (csize.width / this.aspectRatio);

		if (a == 'sw') {
			data.left = cpos.left + (csize.width - data.width);
			data.top = null;
		}
		if (a == 'nw') {
			data.top = cpos.top + (csize.height - data.height);
			data.left = cpos.left + (csize.width - data.width);
		}

		return data;
	},

	_respectSize: function(data, event) {

		var el = this.helper, o = this.options, pRatio = this._aspectRatio || event.shiftKey, a = this.axis,
				ismaxw = isNumber(data.width) && o.maxWidth && (o.maxWidth < data.width), ismaxh = isNumber(data.height) && o.maxHeight && (o.maxHeight < data.height),
					isminw = isNumber(data.width) && o.minWidth && (o.minWidth > data.width), isminh = isNumber(data.height) && o.minHeight && (o.minHeight > data.height);

		if (isminw) data.width = o.minWidth;
		if (isminh) data.height = o.minHeight;
		if (ismaxw) data.width = o.maxWidth;
		if (ismaxh) data.height = o.maxHeight;

		var dw = this.originalPosition.left + this.originalSize.width, dh = this.position.top + this.size.height;
		var cw = /sw|nw|w/.test(a), ch = /nw|ne|n/.test(a);

		if (isminw && cw) data.left = dw - o.minWidth;
		if (ismaxw && cw) data.left = dw - o.maxWidth;
		if (isminh && ch)	data.top = dh - o.minHeight;
		if (ismaxh && ch)	data.top = dh - o.maxHeight;

		// fixing jump error on top/left - bug #2330
		var isNotwh = !data.width && !data.height;
		if (isNotwh && !data.left && data.top) data.top = null;
		else if (isNotwh && !data.top && data.left) data.left = null;

		return data;
	},

	_proportionallyResize: function() {

		var o = this.options;
		if (!this._proportionallyResizeElements.length) return;
		var element = this.helper || this.element;

		for (var i=0; i < this._proportionallyResizeElements.length; i++) {

			var prel = this._proportionallyResizeElements[i];

			if (!this.borderDif) {
				var b = [prel.css('borderTopWidth'), prel.css('borderRightWidth'), prel.css('borderBottomWidth'), prel.css('borderLeftWidth')],
					p = [prel.css('paddingTop'), prel.css('paddingRight'), prel.css('paddingBottom'), prel.css('paddingLeft')];

				this.borderDif = $.map(b, function(v, i) {
					var border = parseInt(v,10)||0, padding = parseInt(p[i],10)||0;
					return border + padding;
				});
			}

			if ($.browser.msie && !(!($(element).is(':hidden') || $(element).parents(':hidden').length)))
				continue;

			prel.css({
				height: (element.height() - this.borderDif[0] - this.borderDif[2]) || 0,
				width: (element.width() - this.borderDif[1] - this.borderDif[3]) || 0
			});

		};

	},

	_renderProxy: function() {

		var el = this.element, o = this.options;
		this.elementOffset = el.offset();

		if(this._helper) {

			this.helper = this.helper || $('<div style="overflow:hidden;"></div>');

			// fix ie6 offset TODO: This seems broken
			var ie6 = $.browser.msie && $.browser.version < 7, ie6offset = (ie6 ? 1 : 0),
			pxyoffset = ( ie6 ? 2 : -1 );

			this.helper.addClass(this._helper).css({
				width: this.element.outerWidth() + pxyoffset,
				height: this.element.outerHeight() + pxyoffset,
				position: 'absolute',
				left: this.elementOffset.left - ie6offset +'px',
				top: this.elementOffset.top - ie6offset +'px',
				zIndex: ++o.zIndex //TODO: Don't modify option
			});

			this.helper
				.appendTo("body")
				.disableSelection();

		} else {
			this.helper = this.element;
		}

	},

	_change: {
		e: function(event, dx, dy) {
			return { width: this.originalSize.width + dx };
		},
		w: function(event, dx, dy) {
			var o = this.options, cs = this.originalSize, sp = this.originalPosition;
			return { left: sp.left + dx, width: cs.width - dx };
		},
		n: function(event, dx, dy) {
			var o = this.options, cs = this.originalSize, sp = this.originalPosition;
			return { top: sp.top + dy, height: cs.height - dy };
		},
		s: function(event, dx, dy) {
			return { height: this.originalSize.height + dy };
		},
		se: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		sw: function(event, dx, dy) {
			return $.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		},
		ne: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [event, dx, dy]));
		},
		nw: function(event, dx, dy) {
			return $.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [event, dx, dy]));
		}
	},

	_propagate: function(n, event) {
		$.ui.plugin.call(this, n, [event, this.ui()]);
		(n != "resize" && this._trigger(n, event, this.ui()));
	},

	plugins: {},

	ui: function() {
		return {
			originalElement: this.originalElement,
			element: this.element,
			helper: this.helper,
			position: this.position,
			size: this.size,
			originalSize: this.originalSize,
			originalPosition: this.originalPosition
		};
	}

}));

$.extend($.ui.resizable, {
	version: "1.7.1",
	eventPrefix: "resize",
	defaults: {
		alsoResize: false,
		animate: false,
		animateDuration: "slow",
		animateEasing: "swing",
		aspectRatio: false,
		autoHide: false,
		cancel: ":input,option",
		containment: false,
		delay: 0,
		distance: 1,
		ghost: false,
		grid: false,
		handles: "e,s,se",
		helper: false,
		maxHeight: null,
		maxWidth: null,
		minHeight: 10,
		minWidth: 10,
		zIndex: 1000
	}
});

/*
 * Resizable Extensions
 */

$.ui.plugin.add("resizable", "alsoResize", {

	start: function(event, ui) {

		var self = $(this).data("resizable"), o = self.options;

		_store = function(exp) {
			$(exp).each(function() {
				$(this).data("resizable-alsoresize", {
					width: parseInt($(this).width(), 10), height: parseInt($(this).height(), 10),
					left: parseInt($(this).css('left'), 10), top: parseInt($(this).css('top'), 10)
				});
			});
		};

		if (typeof(o.alsoResize) == 'object' && !o.alsoResize.parentNode) {
			if (o.alsoResize.length) { o.alsoResize = o.alsoResize[0];	_store(o.alsoResize); }
			else { $.each(o.alsoResize, function(exp, c) { _store(exp); }); }
		}else{
			_store(o.alsoResize);
		}
	},

	resize: function(event, ui){
		var self = $(this).data("resizable"), o = self.options, os = self.originalSize, op = self.originalPosition;

		var delta = {
			height: (self.size.height - os.height) || 0, width: (self.size.width - os.width) || 0,
			top: (self.position.top - op.top) || 0, left: (self.position.left - op.left) || 0
		},

		_alsoResize = function(exp, c) {
			$(exp).each(function() {
				var el = $(this), start = $(this).data("resizable-alsoresize"), style = {}, css = c && c.length ? c : ['width', 'height', 'top', 'left'];

				$.each(css || ['width', 'height', 'top', 'left'], function(i, prop) {
					var sum = (start[prop]||0) + (delta[prop]||0);
					if (sum && sum >= 0)
						style[prop] = sum || null;
				});

				//Opera fixing relative position
				if (/relative/.test(el.css('position')) && $.browser.opera) {
					self._revertToRelativePosition = true;
					el.css({ position: 'absolute', top: 'auto', left: 'auto' });
				}

				el.css(style);
			});
		};

		if (typeof(o.alsoResize) == 'object' && !o.alsoResize.nodeType) {
			$.each(o.alsoResize, function(exp, c) { _alsoResize(exp, c); });
		}else{
			_alsoResize(o.alsoResize);
		}
	},

	stop: function(event, ui){
		var self = $(this).data("resizable");

		//Opera fixing relative position
		if (self._revertToRelativePosition && $.browser.opera) {
			self._revertToRelativePosition = false;
			el.css({ position: 'relative' });
		}

		$(this).removeData("resizable-alsoresize-start");
	}
});

$.ui.plugin.add("resizable", "animate", {

	stop: function(event, ui) {
		var self = $(this).data("resizable"), o = self.options;

		var pr = self._proportionallyResizeElements, ista = pr.length && (/textarea/i).test(pr[0].nodeName),
					soffseth = ista && $.ui.hasScroll(pr[0], 'left') /* TODO - jump height */ ? 0 : self.sizeDiff.height,
						soffsetw = ista ? 0 : self.sizeDiff.width;

		var style = { width: (self.size.width - soffsetw), height: (self.size.height - soffseth) },
					left = (parseInt(self.element.css('left'), 10) + (self.position.left - self.originalPosition.left)) || null,
						top = (parseInt(self.element.css('top'), 10) + (self.position.top - self.originalPosition.top)) || null;

		self.element.animate(
			$.extend(style, top && left ? { top: top, left: left } : {}), {
				duration: o.animateDuration,
				easing: o.animateEasing,
				step: function() {

					var data = {
						width: parseInt(self.element.css('width'), 10),
						height: parseInt(self.element.css('height'), 10),
						top: parseInt(self.element.css('top'), 10),
						left: parseInt(self.element.css('left'), 10)
					};

					if (pr && pr.length) $(pr[0]).css({ width: data.width, height: data.height });

					// propagating resize, and updating values for each animation step
					self._updateCache(data);
					self._propagate("resize", event);

				}
			}
		);
	}

});

$.ui.plugin.add("resizable", "containment", {

	start: function(event, ui) {
		var self = $(this).data("resizable"), o = self.options, el = self.element;
		var oc = o.containment,	ce = (oc instanceof $) ? oc.get(0) : (/parent/.test(oc)) ? el.parent().get(0) : oc;
		if (!ce) return;

		self.containerElement = $(ce);

		if (/document/.test(oc) || oc == document) {
			self.containerOffset = { left: 0, top: 0 };
			self.containerPosition = { left: 0, top: 0 };

			self.parentData = {
				element: $(document), left: 0, top: 0,
				width: $(document).width(), height: $(document).height() || document.body.parentNode.scrollHeight
			};
		}

		// i'm a node, so compute top, left, right, bottom
		else {
			var element = $(ce), p = [];
			$([ "Top", "Right", "Left", "Bottom" ]).each(function(i, name) { p[i] = num(element.css("padding" + name)); });

			self.containerOffset = element.offset();
			self.containerPosition = element.position();
			self.containerSize = { height: (element.innerHeight() - p[3]), width: (element.innerWidth() - p[1]) };

			var co = self.containerOffset, ch = self.containerSize.height,	cw = self.containerSize.width,
						width = ($.ui.hasScroll(ce, "left") ? ce.scrollWidth : cw ), height = ($.ui.hasScroll(ce) ? ce.scrollHeight : ch);

			self.parentData = {
				element: ce, left: co.left, top: co.top, width: width, height: height
			};
		}
	},

	resize: function(event, ui) {
		var self = $(this).data("resizable"), o = self.options,
				ps = self.containerSize, co = self.containerOffset, cs = self.size, cp = self.position,
				pRatio = self._aspectRatio || event.shiftKey, cop = { top:0, left:0 }, ce = self.containerElement;

		if (ce[0] != document && (/static/).test(ce.css('position'))) cop = co;

		if (cp.left < (self._helper ? co.left : 0)) {
			self.size.width = self.size.width + (self._helper ? (self.position.left - co.left) : (self.position.left - cop.left));
			if (pRatio) self.size.height = self.size.width / o.aspectRatio;
			self.position.left = o.helper ? co.left : 0;
		}

		if (cp.top < (self._helper ? co.top : 0)) {
			self.size.height = self.size.height + (self._helper ? (self.position.top - co.top) : self.position.top);
			if (pRatio) self.size.width = self.size.height * o.aspectRatio;
			self.position.top = self._helper ? co.top : 0;
		}

		self.offset.left = self.parentData.left+self.position.left;
		self.offset.top = self.parentData.top+self.position.top;

		var woset = Math.abs( (self._helper ? self.offset.left - cop.left : (self.offset.left - cop.left)) + self.sizeDiff.width ),
					hoset = Math.abs( (self._helper ? self.offset.top - cop.top : (self.offset.top - co.top)) + self.sizeDiff.height );

		var isParent = self.containerElement.get(0) == self.element.parent().get(0),
		    isOffsetRelative = /relative|absolute/.test(self.containerElement.css('position'));

		if(isParent && isOffsetRelative) woset -= self.parentData.left;

		if (woset + self.size.width >= self.parentData.width) {
			self.size.width = self.parentData.width - woset;
			if (pRatio) self.size.height = self.size.width / self.aspectRatio;
		}

		if (hoset + self.size.height >= self.parentData.height) {
			self.size.height = self.parentData.height - hoset;
			if (pRatio) self.size.width = self.size.height * self.aspectRatio;
		}
	},

	stop: function(event, ui){
		var self = $(this).data("resizable"), o = self.options, cp = self.position,
				co = self.containerOffset, cop = self.containerPosition, ce = self.containerElement;

		var helper = $(self.helper), ho = helper.offset(), w = helper.outerWidth() - self.sizeDiff.width, h = helper.outerHeight() - self.sizeDiff.height;

		if (self._helper && !o.animate && (/relative/).test(ce.css('position')))
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });

		if (self._helper && !o.animate && (/static/).test(ce.css('position')))
			$(this).css({ left: ho.left - cop.left - co.left, width: w, height: h });

	}
});

$.ui.plugin.add("resizable", "ghost", {

	start: function(event, ui) {

		var self = $(this).data("resizable"), o = self.options, cs = self.size;

		self.ghost = self.originalElement.clone();
		self.ghost
			.css({ opacity: .25, display: 'block', position: 'relative', height: cs.height, width: cs.width, margin: 0, left: 0, top: 0 })
			.addClass('ui-resizable-ghost')
			.addClass(typeof o.ghost == 'string' ? o.ghost : '');

		self.ghost.appendTo(self.helper);

	},

	resize: function(event, ui){
		var self = $(this).data("resizable"), o = self.options;
		if (self.ghost) self.ghost.css({ position: 'relative', height: self.size.height, width: self.size.width });
	},

	stop: function(event, ui){
		var self = $(this).data("resizable"), o = self.options;
		if (self.ghost && self.helper) self.helper.get(0).removeChild(self.ghost.get(0));
	}

});

$.ui.plugin.add("resizable", "grid", {

	resize: function(event, ui) {
		var self = $(this).data("resizable"), o = self.options, cs = self.size, os = self.originalSize, op = self.originalPosition, a = self.axis, ratio = o._aspectRatio || event.shiftKey;
		o.grid = typeof o.grid == "number" ? [o.grid, o.grid] : o.grid;
		var ox = Math.round((cs.width - os.width) / (o.grid[0]||1)) * (o.grid[0]||1), oy = Math.round((cs.height - os.height) / (o.grid[1]||1)) * (o.grid[1]||1);

		if (/^(se|s|e)$/.test(a)) {
			self.size.width = os.width + ox;
			self.size.height = os.height + oy;
		}
		else if (/^(ne)$/.test(a)) {
			self.size.width = os.width + ox;
			self.size.height = os.height + oy;
			self.position.top = op.top - oy;
		}
		else if (/^(sw)$/.test(a)) {
			self.size.width = os.width + ox;
			self.size.height = os.height + oy;
			self.position.left = op.left - ox;
		}
		else {
			self.size.width = os.width + ox;
			self.size.height = os.height + oy;
			self.position.top = op.top - oy;
			self.position.left = op.left - ox;
		}
	}

});

var num = function(v) {
	return parseInt(v, 10) || 0;
};

var isNumber = function(value) {
	return !isNaN(parseInt(value, 10));
};

})(jQuery);
/*
 * jQuery UI Selectable 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Selectables
 *
 * Depends:
 *	ui.core.js
 */
(function($) {

$.widget("ui.selectable", $.extend({}, $.ui.mouse, {

	_init: function() {
		var self = this;

		this.element.addClass("ui-selectable");

		this.dragged = false;

		// cache selectee children based on filter
		var selectees;
		this.refresh = function() {
			selectees = $(self.options.filter, self.element[0]);
			selectees.each(function() {
				var $this = $(this);
				var pos = $this.offset();
				$.data(this, "selectable-item", {
					element: this,
					$element: $this,
					left: pos.left,
					top: pos.top,
					right: pos.left + $this.outerWidth(),
					bottom: pos.top + $this.outerHeight(),
					startselected: false,
					selected: $this.hasClass('ui-selected'),
					selecting: $this.hasClass('ui-selecting'),
					unselecting: $this.hasClass('ui-unselecting')
				});
			});
		};
		this.refresh();

		this.selectees = selectees.addClass("ui-selectee");

		this._mouseInit();

		this.helper = $(document.createElement('div'))
			.css({border:'1px dotted black'})
			.addClass("ui-selectable-helper");
	},

	destroy: function() {
		this.element
			.removeClass("ui-selectable ui-selectable-disabled")
			.removeData("selectable")
			.unbind(".selectable");
		this._mouseDestroy();
	},

	_mouseStart: function(event) {
		var self = this;

		this.opos = [event.pageX, event.pageY];

		if (this.options.disabled)
			return;

		var options = this.options;

		this.selectees = $(options.filter, this.element[0]);

		this._trigger("start", event);

		$(options.appendTo).append(this.helper);
		// position helper (lasso)
		this.helper.css({
			"z-index": 100,
			"position": "absolute",
			"left": event.clientX,
			"top": event.clientY,
			"width": 0,
			"height": 0
		});

		if (options.autoRefresh) {
			this.refresh();
		}

		this.selectees.filter('.ui-selected').each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.startselected = true;
			if (!event.metaKey) {
				selectee.$element.removeClass('ui-selected');
				selectee.selected = false;
				selectee.$element.addClass('ui-unselecting');
				selectee.unselecting = true;
				// selectable UNSELECTING callback
				self._trigger("unselecting", event, {
					unselecting: selectee.element
				});
			}
		});

		$(event.target).parents().andSelf().each(function() {
			var selectee = $.data(this, "selectable-item");
			if (selectee) {
				selectee.$element.removeClass("ui-unselecting").addClass('ui-selecting');
				selectee.unselecting = false;
				selectee.selecting = true;
				selectee.selected = true;
				// selectable SELECTING callback
				self._trigger("selecting", event, {
					selecting: selectee.element
				});
				return false;
			}
		});

	},

	_mouseDrag: function(event) {
		var self = this;
		this.dragged = true;

		if (this.options.disabled)
			return;

		var options = this.options;

		var x1 = this.opos[0], y1 = this.opos[1], x2 = event.pageX, y2 = event.pageY;
		if (x1 > x2) { var tmp = x2; x2 = x1; x1 = tmp; }
		if (y1 > y2) { var tmp = y2; y2 = y1; y1 = tmp; }
		this.helper.css({left: x1, top: y1, width: x2-x1, height: y2-y1});

		this.selectees.each(function() {
			var selectee = $.data(this, "selectable-item");
			//prevent helper from being selected if appendTo: selectable
			if (!selectee || selectee.element == self.element[0])
				return;
			var hit = false;
			if (options.tolerance == 'touch') {
				hit = ( !(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1) );
			} else if (options.tolerance == 'fit') {
				hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);
			}

			if (hit) {
				// SELECT
				if (selectee.selected) {
					selectee.$element.removeClass('ui-selected');
					selectee.selected = false;
				}
				if (selectee.unselecting) {
					selectee.$element.removeClass('ui-unselecting');
					selectee.unselecting = false;
				}
				if (!selectee.selecting) {
					selectee.$element.addClass('ui-selecting');
					selectee.selecting = true;
					// selectable SELECTING callback
					self._trigger("selecting", event, {
						selecting: selectee.element
					});
				}
			} else {
				// UNSELECT
				if (selectee.selecting) {
					if (event.metaKey && selectee.startselected) {
						selectee.$element.removeClass('ui-selecting');
						selectee.selecting = false;
						selectee.$element.addClass('ui-selected');
						selectee.selected = true;
					} else {
						selectee.$element.removeClass('ui-selecting');
						selectee.selecting = false;
						if (selectee.startselected) {
							selectee.$element.addClass('ui-unselecting');
							selectee.unselecting = true;
						}
						// selectable UNSELECTING callback
						self._trigger("unselecting", event, {
							unselecting: selectee.element
						});
					}
				}
				if (selectee.selected) {
					if (!event.metaKey && !selectee.startselected) {
						selectee.$element.removeClass('ui-selected');
						selectee.selected = false;

						selectee.$element.addClass('ui-unselecting');
						selectee.unselecting = true;
						// selectable UNSELECTING callback
						self._trigger("unselecting", event, {
							unselecting: selectee.element
						});
					}
				}
			}
		});

		return false;
	},

	_mouseStop: function(event) {
		var self = this;

		this.dragged = false;

		var options = this.options;

		$('.ui-unselecting', this.element[0]).each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.$element.removeClass('ui-unselecting');
			selectee.unselecting = false;
			selectee.startselected = false;
			self._trigger("unselected", event, {
				unselected: selectee.element
			});
		});
		$('.ui-selecting', this.element[0]).each(function() {
			var selectee = $.data(this, "selectable-item");
			selectee.$element.removeClass('ui-selecting').addClass('ui-selected');
			selectee.selecting = false;
			selectee.selected = true;
			selectee.startselected = true;
			self._trigger("selected", event, {
				selected: selectee.element
			});
		});
		this._trigger("stop", event);

		this.helper.remove();

		return false;
	}

}));

$.extend($.ui.selectable, {
	version: "1.7.1",
	defaults: {
		appendTo: 'body',
		autoRefresh: true,
		cancel: ":input,option",
		delay: 0,
		distance: 0,
		filter: '*',
		tolerance: 'touch'
	}
});

})(jQuery);
/*
 * jQuery UI Sortable 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *	ui.core.js
 */
(function($) {

$.widget("ui.sortable", $.extend({}, $.ui.mouse, {
	_init: function() {

		var o = this.options;
		this.containerCache = {};
		this.element.addClass("ui-sortable");

		//Get the items
		this.refresh();

		//Let's determine if the items are floating
		this.floating = this.items.length ? (/left|right/).test(this.items[0].item.css('float')) : false;

		//Let's determine the parent's offset
		this.offset = this.element.offset();

		//Initialize mouse events for interaction
		this._mouseInit();

	},

	destroy: function() {
		this.element
			.removeClass("ui-sortable ui-sortable-disabled")
			.removeData("sortable")
			.unbind(".sortable");
		this._mouseDestroy();

		for ( var i = this.items.length - 1; i >= 0; i-- )
			this.items[i].item.removeData("sortable-item");
	},

	_mouseCapture: function(event, overrideHandle) {

		if (this.reverting) {
			return false;
		}

		if(this.options.disabled || this.options.type == 'static') return false;

		//We have to refresh the items data once first
		this._refreshItems(event);

		//Find out if the clicked node (or one of its parents) is a actual item in this.items
		var currentItem = null, self = this, nodes = $(event.target).parents().each(function() {
			if($.data(this, 'sortable-item') == self) {
				currentItem = $(this);
				return false;
			}
		});
		if($.data(event.target, 'sortable-item') == self) currentItem = $(event.target);

		if(!currentItem) return false;
		if(this.options.handle && !overrideHandle) {
			var validHandle = false;

			$(this.options.handle, currentItem).find("*").andSelf().each(function() { if(this == event.target) validHandle = true; });
			if(!validHandle) return false;
		}

		this.currentItem = currentItem;
		this._removeCurrentsFromItems();
		return true;

	},

	_mouseStart: function(event, overrideHandle, noActivation) {

		var o = this.options, self = this;
		this.currentContainer = this;

		//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
		this.refreshPositions();

		//Create and append the visible helper
		this.helper = this._createHelper(event);

		//Cache the helper size
		this._cacheHelperProportions();

		/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 */

		//Cache the margins of the original element
		this._cacheMargins();

		//Get the next scrolling parent
		this.scrollParent = this.helper.scrollParent();

		//The element's absolute position on the page minus margins
		this.offset = this.currentItem.offset();
		this.offset = {
			top: this.offset.top - this.margins.top,
			left: this.offset.left - this.margins.left
		};

		// Only after we got the offset, we can change the helper's position to absolute
		// TODO: Still need to figure out a way to make relative sorting possible
		this.helper.css("position", "absolute");
		this.cssPosition = this.helper.css("position");

		$.extend(this.offset, {
			click: { //Where the click happened, relative to the element
				left: event.pageX - this.offset.left,
				top: event.pageY - this.offset.top
			},
			parent: this._getParentOffset(),
			relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
		});

		//Generate the original position
		this.originalPosition = this._generatePosition(event);
		this.originalPageX = event.pageX;
		this.originalPageY = event.pageY;

		//Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
		if(o.cursorAt)
			this._adjustOffsetFromHelper(o.cursorAt);

		//Cache the former DOM position
		this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

		//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
		if(this.helper[0] != this.currentItem[0]) {
			this.currentItem.hide();
		}

		//Create the placeholder
		this._createPlaceholder();

		//Set a containment if given in the options
		if(o.containment)
			this._setContainment();

		if(o.cursor) { // cursor option
			if ($('body').css("cursor")) this._storedCursor = $('body').css("cursor");
			$('body').css("cursor", o.cursor);
		}

		if(o.opacity) { // opacity option
			if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
			this.helper.css("opacity", o.opacity);
		}

		if(o.zIndex) { // zIndex option
			if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
			this.helper.css("zIndex", o.zIndex);
		}

		//Prepare scrolling
		if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
			this.overflowOffset = this.scrollParent.offset();

		//Call callbacks
		this._trigger("start", event, this._uiHash());

		//Recache the helper size
		if(!this._preserveHelperProportions)
			this._cacheHelperProportions();


		//Post 'activate' events to possible containers
		if(!noActivation) {
			 for (var i = this.containers.length - 1; i >= 0; i--) { this.containers[i]._trigger("activate", event, self._uiHash(this)); }
		}

		//Prepare possible droppables
		if($.ui.ddmanager)
			$.ui.ddmanager.current = this;

		if ($.ui.ddmanager && !o.dropBehaviour)
			$.ui.ddmanager.prepareOffsets(this, event);

		this.dragging = true;

		this.helper.addClass("ui-sortable-helper");
		this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
		return true;

	},

	_mouseDrag: function(event) {

		//Compute the helpers position
		this.position = this._generatePosition(event);
		this.positionAbs = this._convertPositionTo("absolute");

		if (!this.lastPositionAbs) {
			this.lastPositionAbs = this.positionAbs;
		}

		//Do scrolling
		if(this.options.scroll) {
			var o = this.options, scrolled = false;
			if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

				if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
				else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
					this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;

				if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
				else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
					this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;

			} else {

				if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
				else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
					scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);

				if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
				else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
					scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);

			}

			if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
				$.ui.ddmanager.prepareOffsets(this, event);
		}

		//Regenerate the absolute position used for position checks
		this.positionAbs = this._convertPositionTo("absolute");

		//Set the helper position
		if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
		if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';

		//Rearrange
		for (var i = this.items.length - 1; i >= 0; i--) {

			//Cache variables and intersection, continue if no intersection
			var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
			if (!intersection) continue;

			if(itemElement != this.currentItem[0] //cannot intersect with itself
				&&	this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
				&&	!$.ui.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
				&& (this.options.type == 'semi-dynamic' ? !$.ui.contains(this.element[0], itemElement) : true)
			) {

				this.direction = intersection == 1 ? "down" : "up";

				if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
					this._rearrange(event, item);
				} else {
					break;
				}

				this._trigger("change", event, this._uiHash());
				break;
			}
		}

		//Post events to containers
		this._contactContainers(event);

		//Interconnect with droppables
		if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

		//Call callbacks
		this._trigger('sort', event, this._uiHash());

		this.lastPositionAbs = this.positionAbs;
		return false;

	},

	_mouseStop: function(event, noPropagation) {

		if(!event) return;

		//If we are using droppables, inform the manager about the drop
		if ($.ui.ddmanager && !this.options.dropBehaviour)
			$.ui.ddmanager.drop(this, event);

		if(this.options.revert) {
			var self = this;
			var cur = self.placeholder.offset();

			self.reverting = true;

			$(this.helper).animate({
				left: cur.left - this.offset.parent.left - self.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
				top: cur.top - this.offset.parent.top - self.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
			}, parseInt(this.options.revert, 10) || 500, function() {
				self._clear(event);
			});
		} else {
			this._clear(event, noPropagation);
		}

		return false;

	},

	cancel: function() {

		var self = this;

		if(this.dragging) {

			this._mouseUp();

			if(this.options.helper == "original")
				this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
			else
				this.currentItem.show();

			//Post deactivating events to containers
			for (var i = this.containers.length - 1; i >= 0; i--){
				this.containers[i]._trigger("deactivate", null, self._uiHash(this));
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", null, self._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		}

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		if(this.placeholder[0].parentNode) this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
		if(this.options.helper != "original" && this.helper && this.helper[0].parentNode) this.helper.remove();

		$.extend(this, {
			helper: null,
			dragging: false,
			reverting: false,
			_noFinalSort: null
		});

		if(this.domPosition.prev) {
			$(this.domPosition.prev).after(this.currentItem);
		} else {
			$(this.domPosition.parent).prepend(this.currentItem);
		}

		return true;

	},

	serialize: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var str = []; o = o || {};

		$(items).each(function() {
			var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
			if(res) str.push((o.key || res[1]+'[]')+'='+(o.key && o.expression ? res[1] : res[2]));
		});

		return str.join('&');

	},

	toArray: function(o) {

		var items = this._getItemsAsjQuery(o && o.connected);
		var ret = []; o = o || {};

		items.each(function() { ret.push($(o.item || this).attr(o.attribute || 'id') || ''); });
		return ret;

	},

	/* Be careful with the following core functions */
	_intersectsWith: function(item) {

		var x1 = this.positionAbs.left,
			x2 = x1 + this.helperProportions.width,
			y1 = this.positionAbs.top,
			y2 = y1 + this.helperProportions.height;

		var l = item.left,
			r = l + item.width,
			t = item.top,
			b = t + item.height;

		var dyClick = this.offset.click.top,
			dxClick = this.offset.click.left;

		var isOverElement = (y1 + dyClick) > t && (y1 + dyClick) < b && (x1 + dxClick) > l && (x1 + dxClick) < r;

		if(	   this.options.tolerance == "pointer"
			|| this.options.forcePointerForContainers
			|| (this.options.tolerance != "pointer" && this.helperProportions[this.floating ? 'width' : 'height'] > item[this.floating ? 'width' : 'height'])
		) {
			return isOverElement;
		} else {

			return (l < x1 + (this.helperProportions.width / 2) // Right Half
				&& x2 - (this.helperProportions.width / 2) < r // Left Half
				&& t < y1 + (this.helperProportions.height / 2) // Bottom Half
				&& y2 - (this.helperProportions.height / 2) < b ); // Top Half

		}
	},

	_intersectsWithPointer: function(item) {

		var isOverElementHeight = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
			isOverElementWidth = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
			isOverElement = isOverElementHeight && isOverElementWidth,
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (!isOverElement)
			return false;

		return this.floating ?
			( ((horizontalDirection && horizontalDirection == "right") || verticalDirection == "down") ? 2 : 1 )
			: ( verticalDirection && (verticalDirection == "down" ? 2 : 1) );

	},

	_intersectsWithSides: function(item) {

		var isOverBottomHalf = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
			isOverRightHalf = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
			verticalDirection = this._getDragVerticalDirection(),
			horizontalDirection = this._getDragHorizontalDirection();

		if (this.floating && horizontalDirection) {
			return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
		} else {
			return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && !isOverBottomHalf));
		}

	},

	_getDragVerticalDirection: function() {
		var delta = this.positionAbs.top - this.lastPositionAbs.top;
		return delta != 0 && (delta > 0 ? "down" : "up");
	},

	_getDragHorizontalDirection: function() {
		var delta = this.positionAbs.left - this.lastPositionAbs.left;
		return delta != 0 && (delta > 0 ? "right" : "left");
	},

	refresh: function(event) {
		this._refreshItems(event);
		this.refreshPositions();
	},

	_connectWith: function() {
		var options = this.options;
		return options.connectWith.constructor == String
			? [options.connectWith]
			: options.connectWith;
	},
	
	_getItemsAsjQuery: function(connected) {

		var self = this;
		var items = [];
		var queries = [];
		var connectWith = this._connectWith();

		if(connectWith && connected) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], 'sortable');
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper"), inst]);
					}
				};
			};
		}

		queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper"), this]);

		for (var i = queries.length - 1; i >= 0; i--){
			queries[i][0].each(function() {
				items.push(this);
			});
		};

		return $(items);

	},

	_removeCurrentsFromItems: function() {

		var list = this.currentItem.find(":data(sortable-item)");

		for (var i=0; i < this.items.length; i++) {

			for (var j=0; j < list.length; j++) {
				if(list[j] == this.items[i].item[0])
					this.items.splice(i,1);
			};

		};

	},

	_refreshItems: function(event) {

		this.items = [];
		this.containers = [this];
		var items = this.items;
		var self = this;
		var queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]];
		var connectWith = this._connectWith();

		if(connectWith) {
			for (var i = connectWith.length - 1; i >= 0; i--){
				var cur = $(connectWith[i]);
				for (var j = cur.length - 1; j >= 0; j--){
					var inst = $.data(cur[j], 'sortable');
					if(inst && inst != this && !inst.options.disabled) {
						queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
						this.containers.push(inst);
					}
				};
			};
		}

		for (var i = queries.length - 1; i >= 0; i--) {
			var targetData = queries[i][1];
			var _queries = queries[i][0];

			for (var j=0, queriesLength = _queries.length; j < queriesLength; j++) {
				var item = $(_queries[j]);

				item.data('sortable-item', targetData); // Data for target checking (mouse manager)

				items.push({
					item: item,
					instance: targetData,
					width: 0, height: 0,
					left: 0, top: 0
				});
			};
		};

	},

	refreshPositions: function(fast) {

		//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
		if(this.offsetParent && this.helper) {
			this.offset.parent = this._getParentOffset();
		}

		for (var i = this.items.length - 1; i >= 0; i--){
			var item = this.items[i];

			//We ignore calculating positions of all connected containers when we're not over them
			if(item.instance != this.currentContainer && this.currentContainer && item.item[0] != this.currentItem[0])
				continue;

			var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

			if (!fast) {
				item.width = t.outerWidth();
				item.height = t.outerHeight();
			}

			var p = t.offset();
			item.left = p.left;
			item.top = p.top;
		};

		if(this.options.custom && this.options.custom.refreshContainers) {
			this.options.custom.refreshContainers.call(this);
		} else {
			for (var i = this.containers.length - 1; i >= 0; i--){
				var p = this.containers[i].element.offset();
				this.containers[i].containerCache.left = p.left;
				this.containers[i].containerCache.top = p.top;
				this.containers[i].containerCache.width	= this.containers[i].element.outerWidth();
				this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			};
		}

	},

	_createPlaceholder: function(that) {

		var self = that || this, o = self.options;

		if(!o.placeholder || o.placeholder.constructor == String) {
			var className = o.placeholder;
			o.placeholder = {
				element: function() {

					var el = $(document.createElement(self.currentItem[0].nodeName))
						.addClass(className || self.currentItem[0].className+" ui-sortable-placeholder")
						.removeClass("ui-sortable-helper")[0];

					if(!className)
						el.style.visibility = "hidden";

					return el;
				},
				update: function(container, p) {

					// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
					// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
					if(className && !o.forcePlaceholderSize) return;

					//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
					if(!p.height()) { p.height(self.currentItem.innerHeight() - parseInt(self.currentItem.css('paddingTop')||0, 10) - parseInt(self.currentItem.css('paddingBottom')||0, 10)); };
					if(!p.width()) { p.width(self.currentItem.innerWidth() - parseInt(self.currentItem.css('paddingLeft')||0, 10) - parseInt(self.currentItem.css('paddingRight')||0, 10)); };
				}
			};
		}

		//Create the placeholder
		self.placeholder = $(o.placeholder.element.call(self.element, self.currentItem));

		//Append it after the actual current item
		self.currentItem.after(self.placeholder);

		//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
		o.placeholder.update(self, self.placeholder);

	},

	_contactContainers: function(event) {
		for (var i = this.containers.length - 1; i >= 0; i--){

			if(this._intersectsWith(this.containers[i].containerCache)) {
				if(!this.containers[i].containerCache.over) {

					if(this.currentContainer != this.containers[i]) {

						//When entering a new container, we will find the item with the least distance and append our item near it
						var dist = 10000; var itemWithLeastDistance = null; var base = this.positionAbs[this.containers[i].floating ? 'left' : 'top'];
						for (var j = this.items.length - 1; j >= 0; j--) {
							if(!$.ui.contains(this.containers[i].element[0], this.items[j].item[0])) continue;
							var cur = this.items[j][this.containers[i].floating ? 'left' : 'top'];
							if(Math.abs(cur - base) < dist) {
								dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j];
							}
						}

						if(!itemWithLeastDistance && !this.options.dropOnEmpty) //Check if dropOnEmpty is enabled
							continue;

						this.currentContainer = this.containers[i];
						itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[i].element, true);
						this._trigger("change", event, this._uiHash());
						this.containers[i]._trigger("change", event, this._uiHash(this));

						//Update the placeholder
						this.options.placeholder.update(this.currentContainer, this.placeholder);

					}

					this.containers[i]._trigger("over", event, this._uiHash(this));
					this.containers[i].containerCache.over = 1;
				}
			} else {
				if(this.containers[i].containerCache.over) {
					this.containers[i]._trigger("out", event, this._uiHash(this));
					this.containers[i].containerCache.over = 0;
				}
			}

		};
	},

	_createHelper: function(event) {

		var o = this.options;
		var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);

		if(!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
			$(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);

		if(helper[0] == this.currentItem[0])
			this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };

		if(helper[0].style.width == '' || o.forceHelperSize) helper.width(this.currentItem.width());
		if(helper[0].style.height == '' || o.forceHelperSize) helper.height(this.currentItem.height());

		return helper;

	},

	_adjustOffsetFromHelper: function(obj) {
		if(obj.left != undefined) this.offset.click.left = obj.left + this.margins.left;
		if(obj.right != undefined) this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
		if(obj.top != undefined) this.offset.click.top = obj.top + this.margins.top;
		if(obj.bottom != undefined) this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
	},

	_getParentOffset: function() {


		//Get the offsetParent and cache its position
		this.offsetParent = this.helper.offsetParent();
		var po = this.offsetParent.offset();

		// This is a special case where we need to modify a offset calculated on start, since the following happened:
		// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
		// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
		//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
		if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
			po.left += this.scrollParent.scrollLeft();
			po.top += this.scrollParent.scrollTop();
		}

		if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
		|| (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie)) //Ugly IE fix
			po = { top: 0, left: 0 };

		return {
			top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
			left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
		};

	},

	_getRelativeOffset: function() {

		if(this.cssPosition == "relative") {
			var p = this.currentItem.position();
			return {
				top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
				left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
			};
		} else {
			return { top: 0, left: 0 };
		}

	},

	_cacheMargins: function() {
		this.margins = {
			left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
			top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
		};
	},

	_cacheHelperProportions: function() {
		this.helperProportions = {
			width: this.helper.outerWidth(),
			height: this.helper.outerHeight()
		};
	},

	_setContainment: function() {

		var o = this.options;
		if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
		if(o.containment == 'document' || o.containment == 'window') this.containment = [
			0 - this.offset.relative.left - this.offset.parent.left,
			0 - this.offset.relative.top - this.offset.parent.top,
			$(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
			($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
		];

		if(!(/^(document|window|parent)$/).test(o.containment)) {
			var ce = $(o.containment)[0];
			var co = $(o.containment).offset();
			var over = ($(ce).css("overflow") != 'hidden');

			this.containment = [
				co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
				co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
				co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
				co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
			];
		}

	},

	_convertPositionTo: function(d, pos) {

		if(!pos) pos = this.position;
		var mod = d == "absolute" ? 1 : -1;
		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		return {
			top: (
				pos.top																	// The absolute mouse position
				+ this.offset.relative.top * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.top * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
			),
			left: (
				pos.left																// The absolute mouse position
				+ this.offset.relative.left * mod										// Only for relative positioned nodes: Relative offset from element to offset parent
				+ this.offset.parent.left * mod											// The offsetParent's offset without borders (offset + border)
				- ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
			)
		};

	},

	_generatePosition: function(event) {

		var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

		// This is another very weird special case that only happens for relative elements:
		// 1. If the css position is relative
		// 2. and the scroll parent is the document or similar to the offset parent
		// we have to refresh the relative offset during the scroll so there are no jumps
		if(this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
			this.offset.relative = this._getRelativeOffset();
		}

		var pageX = event.pageX;
		var pageY = event.pageY;

		/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */

		if(this.originalPosition) { //If we are not dragging yet, we won't check for options

			if(this.containment) {
				if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
				if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
				if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
				if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
			}

			if(o.grid) {
				var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
				pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

				var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
				pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
			}

		}

		return {
			top: (
				pageY																// The absolute mouse position
				- this.offset.click.top													// Click offset (relative to the element)
				- this.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.top												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
			),
			left: (
				pageX																// The absolute mouse position
				- this.offset.click.left												// Click offset (relative to the element)
				- this.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
				- this.offset.parent.left												// The offsetParent's offset without borders (offset + border)
				+ ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
			)
		};

	},

	_rearrange: function(event, i, a, hardRefresh) {

		a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction == 'down' ? i.item[0] : i.item[0].nextSibling));

		//Various things done here to improve the performance:
		// 1. we create a setTimeout, that calls refreshPositions
		// 2. on the instance, we have a counter variable, that get's higher after every append
		// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
		// 4. this lets only the last addition to the timeout stack through
		this.counter = this.counter ? ++this.counter : 1;
		var self = this, counter = this.counter;

		window.setTimeout(function() {
			if(counter == self.counter) self.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
		},0);

	},

	_clear: function(event, noPropagation) {

		this.reverting = false;
		// We delay all events that have to be triggered to after the point where the placeholder has been removed and
		// everything else normalized again
		var delayedTriggers = [], self = this;

		// We first have to update the dom position of the actual currentItem
		// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
		if(!this._noFinalSort && this.currentItem[0].parentNode) this.placeholder.before(this.currentItem);
		this._noFinalSort = null;

		if(this.helper[0] == this.currentItem[0]) {
			for(var i in this._storedCSS) {
				if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
			}
			this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
		} else {
			this.currentItem.show();
		}

		if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
		if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
		if(!$.ui.contains(this.element[0], this.currentItem[0])) { //Node was moved out of the current element
			if(!noPropagation) delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
			for (var i = this.containers.length - 1; i >= 0; i--){
				if($.ui.contains(this.containers[i].element[0], this.currentItem[0]) && !noPropagation) {
					delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
					delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.containers[i]));
				}
			};
		};

		//Post events to containers
		for (var i = this.containers.length - 1; i >= 0; i--){
			if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
			if(this.containers[i].containerCache.over) {
				delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
				this.containers[i].containerCache.over = 0;
			}
		}

		//Do what was originally in plugins
		if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
		if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset cursor
		if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index

		this.dragging = false;
		if(this.cancelHelperRemoval) {
			if(!noPropagation) {
				this._trigger("beforeStop", event, this._uiHash());
				for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
				this._trigger("stop", event, this._uiHash());
			}
			return false;
		}

		if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

		//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
		this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

		if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

		if(!noPropagation) {
			for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
			this._trigger("stop", event, this._uiHash());
		}

		this.fromOutside = false;
		return true;

	},

	_trigger: function() {
		if ($.widget.prototype._trigger.apply(this, arguments) === false) {
			this.cancel();
		}
	},

	_uiHash: function(inst) {
		var self = inst || this;
		return {
			helper: self.helper,
			placeholder: self.placeholder || $([]),
			position: self.position,
			absolutePosition: self.positionAbs, //deprecated
			offset: self.positionAbs,
			item: self.currentItem,
			sender: inst ? inst.element : null
		};
	}

}));

$.extend($.ui.sortable, {
	getter: "serialize toArray",
	version: "1.7.1",
	eventPrefix: "sort",
	defaults: {
		appendTo: "parent",
		axis: false,
		cancel: ":input,option",
		connectWith: false,
		containment: false,
		cursor: 'auto',
		cursorAt: false,
		delay: 0,
		distance: 1,
		dropOnEmpty: true,
		forcePlaceholderSize: false,
		forceHelperSize: false,
		grid: false,
		handle: false,
		helper: "original",
		items: '> *',
		opacity: false,
		placeholder: false,
		revert: false,
		scroll: true,
		scrollSensitivity: 20,
		scrollSpeed: 20,
		scope: "default",
		tolerance: "intersect",
		zIndex: 1000
	}
});

})(jQuery);
/*
 * jQuery UI Accordion 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Accordion
 *
 * Depends:
 *	ui.core.js
 */
(function($) {

$.widget("ui.accordion", {

	_init: function() {

		var o = this.options, self = this;
		this.running = 0;

		// if the user set the alwaysOpen option on init
		// then we need to set the collapsible option
		// if they set both on init, collapsible will take priority
		if (o.collapsible == $.ui.accordion.defaults.collapsible &&
			o.alwaysOpen != $.ui.accordion.defaults.alwaysOpen) {
			o.collapsible = !o.alwaysOpen;
		}

		if ( o.navigation ) {
			var current = this.element.find("a").filter(o.navigationFilter);
			if ( current.length ) {
				if ( current.filter(o.header).length ) {
					this.active = current;
				} else {
					this.active = current.parent().parent().prev();
					current.addClass("ui-accordion-content-active");
				}
			}
		}

		this.element.addClass("ui-accordion ui-widget ui-helper-reset");
		
		// in lack of child-selectors in CSS we need to mark top-LIs in a UL-accordion for some IE-fix
		if (this.element[0].nodeName == "UL") {
			this.element.children("li").addClass("ui-accordion-li-fix");
		}

		this.headers = this.element.find(o.header).addClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all")
			.bind("mouseenter.accordion", function(){ $(this).addClass('ui-state-hover'); })
			.bind("mouseleave.accordion", function(){ $(this).removeClass('ui-state-hover'); })
			.bind("focus.accordion", function(){ $(this).addClass('ui-state-focus'); })
			.bind("blur.accordion", function(){ $(this).removeClass('ui-state-focus'); });

		this.headers
			.next()
				.addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom");

		this.active = this._findActive(this.active || o.active).toggleClass("ui-state-default").toggleClass("ui-state-active").toggleClass("ui-corner-all").toggleClass("ui-corner-top");
		this.active.next().addClass('ui-accordion-content-active');

		//Append icon elements
		$("<span/>").addClass("ui-icon " + o.icons.header).prependTo(this.headers);
		this.active.find(".ui-icon").toggleClass(o.icons.header).toggleClass(o.icons.headerSelected);

		// IE7-/Win - Extra vertical space in lists fixed
		if ($.browser.msie) {
			this.element.find('a').css('zoom', '1');
		}

		this.resize();

		//ARIA
		this.element.attr('role','tablist');

		this.headers
			.attr('role','tab')
			.bind('keydown', function(event) { return self._keydown(event); })
			.next()
			.attr('role','tabpanel');

		this.headers
			.not(this.active || "")
			.attr('aria-expanded','false')
			.attr("tabIndex", "-1")
			.next()
			.hide();

		// make sure at least one header is in the tab order
		if (!this.active.length) {
			this.headers.eq(0).attr('tabIndex','0');
		} else {
			this.active
				.attr('aria-expanded','true')
				.attr('tabIndex', '0');
		}

		// only need links in taborder for Safari
		if (!$.browser.safari)
			this.headers.find('a').attr('tabIndex','-1');

		if (o.event) {
			this.headers.bind((o.event) + ".accordion", function(event) { return self._clickHandler.call(self, event, this); });
		}

	},

	destroy: function() {
		var o = this.options;

		this.element
			.removeClass("ui-accordion ui-widget ui-helper-reset")
			.removeAttr("role")
			.unbind('.accordion')
			.removeData('accordion');

		this.headers
			.unbind(".accordion")
			.removeClass("ui-accordion-header ui-helper-reset ui-state-default ui-corner-all ui-state-active ui-corner-top")
			.removeAttr("role").removeAttr("aria-expanded").removeAttr("tabindex");

		this.headers.find("a").removeAttr("tabindex");
		this.headers.children(".ui-icon").remove();
		var contents = this.headers.next().css("display", "").removeAttr("role").removeClass("ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content ui-accordion-content-active");
		if (o.autoHeight || o.fillHeight) {
			contents.css("height", "");
		}
	},
	
	_setData: function(key, value) {
		if(key == 'alwaysOpen') { key = 'collapsible'; value = !value; }
		$.widget.prototype._setData.apply(this, arguments);	
	},

	_keydown: function(event) {

		var o = this.options, keyCode = $.ui.keyCode;

		if (o.disabled || event.altKey || event.ctrlKey)
			return;

		var length = this.headers.length;
		var currentIndex = this.headers.index(event.target);
		var toFocus = false;

		switch(event.keyCode) {
			case keyCode.RIGHT:
			case keyCode.DOWN:
				toFocus = this.headers[(currentIndex + 1) % length];
				break;
			case keyCode.LEFT:
			case keyCode.UP:
				toFocus = this.headers[(currentIndex - 1 + length) % length];
				break;
			case keyCode.SPACE:
			case keyCode.ENTER:
				return this._clickHandler({ target: event.target }, event.target);
		}

		if (toFocus) {
			$(event.target).attr('tabIndex','-1');
			$(toFocus).attr('tabIndex','0');
			toFocus.focus();
			return false;
		}

		return true;

	},

	resize: function() {

		var o = this.options, maxHeight;

		if (o.fillSpace) {
			
			if($.browser.msie) { var defOverflow = this.element.parent().css('overflow'); this.element.parent().css('overflow', 'hidden'); }
			maxHeight = this.element.parent().height();
			if($.browser.msie) { this.element.parent().css('overflow', defOverflow); }
	
			this.headers.each(function() {
				maxHeight -= $(this).outerHeight();
			});

			var maxPadding = 0;
			this.headers.next().each(function() {
				maxPadding = Math.max(maxPadding, $(this).innerHeight() - $(this).height());
			}).height(Math.max(0, maxHeight - maxPadding))
			.css('overflow', 'auto');

		} else if ( o.autoHeight ) {
			maxHeight = 0;
			this.headers.next().each(function() {
				maxHeight = Math.max(maxHeight, $(this).outerHeight());
			}).height(maxHeight);
		}

	},

	activate: function(index) {
		// call clickHandler with custom event
		var active = this._findActive(index)[0];
		this._clickHandler({ target: active }, active);
	},

	_findActive: function(selector) {
		return selector
			? typeof selector == "number"
				? this.headers.filter(":eq(" + selector + ")")
				: this.headers.not(this.headers.not(selector))
			: selector === false
				? $([])
				: this.headers.filter(":eq(0)");
	},

	_clickHandler: function(event, target) {

		var o = this.options;
		if (o.disabled) return false;

		// called only when using activate(false) to close all parts programmatically
		if (!event.target && o.collapsible) {
			this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all")
				.find(".ui-icon").removeClass(o.icons.headerSelected).addClass(o.icons.header);
			this.active.next().addClass('ui-accordion-content-active');
			var toHide = this.active.next(),
				data = {
					options: o,
					newHeader: $([]),
					oldHeader: o.active,
					newContent: $([]),
					oldContent: toHide
				},
				toShow = (this.active = $([]));
			this._toggle(toShow, toHide, data);
			return false;
		}

		// get the click target
		var clicked = $(event.currentTarget || target);
		var clickedIsActive = clicked[0] == this.active[0];

		// if animations are still active, or the active header is the target, ignore click
		if (this.running || (!o.collapsible && clickedIsActive)) {
			return false;
		}

		// switch classes
		this.active.removeClass("ui-state-active ui-corner-top").addClass("ui-state-default ui-corner-all")
			.find(".ui-icon").removeClass(o.icons.headerSelected).addClass(o.icons.header);
		this.active.next().addClass('ui-accordion-content-active');
		if (!clickedIsActive) {
			clicked.removeClass("ui-state-default ui-corner-all").addClass("ui-state-active ui-corner-top")
				.find(".ui-icon").removeClass(o.icons.header).addClass(o.icons.headerSelected);
			clicked.next().addClass('ui-accordion-content-active');
		}

		// find elements to show and hide
		var toShow = clicked.next(),
			toHide = this.active.next(),
			data = {
				options: o,
				newHeader: clickedIsActive && o.collapsible ? $([]) : clicked,
				oldHeader: this.active,
				newContent: clickedIsActive && o.collapsible ? $([]) : toShow.find('> *'),
				oldContent: toHide.find('> *')
			},
			down = this.headers.index( this.active[0] ) > this.headers.index( clicked[0] );

		this.active = clickedIsActive ? $([]) : clicked;
		this._toggle(toShow, toHide, data, clickedIsActive, down);

		return false;

	},

	_toggle: function(toShow, toHide, data, clickedIsActive, down) {

		var o = this.options, self = this;

		this.toShow = toShow;
		this.toHide = toHide;
		this.data = data;

		var complete = function() { if(!self) return; return self._completed.apply(self, arguments); };

		// trigger changestart event
		this._trigger("changestart", null, this.data);

		// count elements to animate
		this.running = toHide.size() === 0 ? toShow.size() : toHide.size();

		if (o.animated) {

			var animOptions = {};

			if ( o.collapsible && clickedIsActive ) {
				animOptions = {
					toShow: $([]),
					toHide: toHide,
					complete: complete,
					down: down,
					autoHeight: o.autoHeight || o.fillSpace
				};
			} else {
				animOptions = {
					toShow: toShow,
					toHide: toHide,
					complete: complete,
					down: down,
					autoHeight: o.autoHeight || o.fillSpace
				};
			}

			if (!o.proxied) {
				o.proxied = o.animated;
			}

			if (!o.proxiedDuration) {
				o.proxiedDuration = o.duration;
			}

			o.animated = $.isFunction(o.proxied) ?
				o.proxied(animOptions) : o.proxied;

			o.duration = $.isFunction(o.proxiedDuration) ?
				o.proxiedDuration(animOptions) : o.proxiedDuration;

			var animations = $.ui.accordion.animations,
				duration = o.duration,
				easing = o.animated;

			if (!animations[easing]) {
				animations[easing] = function(options) {
					this.slide(options, {
						easing: easing,
						duration: duration || 700
					});
				};
			}

			animations[easing](animOptions);

		} else {

			if (o.collapsible && clickedIsActive) {
				toShow.toggle();
			} else {
				toHide.hide();
				toShow.show();
			}

			complete(true);

		}

		toHide.prev().attr('aria-expanded','false').attr("tabIndex", "-1").blur();
		toShow.prev().attr('aria-expanded','true').attr("tabIndex", "0").focus();

	},

	_completed: function(cancel) {

		var o = this.options;

		this.running = cancel ? 0 : --this.running;
		if (this.running) return;

		if (o.clearStyle) {
			this.toShow.add(this.toHide).css({
				height: "",
				overflow: ""
			});
		}

		this._trigger('change', null, this.data);
	}

});


$.extend($.ui.accordion, {
	version: "1.7.1",
	defaults: {
		active: null,
		alwaysOpen: true, //deprecated, use collapsible
		animated: 'slide',
		autoHeight: true,
		clearStyle: false,
		collapsible: false,
		event: "click",
		fillSpace: false,
		header: "> li > :first-child,> :not(li):even",
		icons: {
			header: "ui-icon-triangle-1-e",
			headerSelected: "ui-icon-triangle-1-s"
		},
		navigation: false,
		navigationFilter: function() {
			return this.href.toLowerCase() == location.href.toLowerCase();
		}
	},
	animations: {
		slide: function(options, additions) {
			options = $.extend({
				easing: "swing",
				duration: 300
			}, options, additions);
			if ( !options.toHide.size() ) {
				options.toShow.animate({height: "show"}, options);
				return;
			}
			if ( !options.toShow.size() ) {
				options.toHide.animate({height: "hide"}, options);
				return;
			}
			var overflow = options.toShow.css('overflow'),
				percentDone,
				showProps = {},
				hideProps = {},
				fxAttrs = [ "height", "paddingTop", "paddingBottom" ],
				originalWidth;
			// fix width before calculating height of hidden element
			var s = options.toShow;
			originalWidth = s[0].style.width;
			s.width( parseInt(s.parent().width(),10) - parseInt(s.css("paddingLeft"),10) - parseInt(s.css("paddingRight"),10) - (parseInt(s.css("borderLeftWidth"),10) || 0) - (parseInt(s.css("borderRightWidth"),10) || 0) );
			
			$.each(fxAttrs, function(i, prop) {
				hideProps[prop] = 'hide';
				
				var parts = ('' + $.css(options.toShow[0], prop)).match(/^([\d+-.]+)(.*)$/);
				showProps[prop] = {
					value: parts[1],
					unit: parts[2] || 'px'
				};
			});
			options.toShow.css({ height: 0, overflow: 'hidden' }).show();
			options.toHide.filter(":hidden").each(options.complete).end().filter(":visible").animate(hideProps,{
				step: function(now, settings) {
					// only calculate the percent when animating height
					// IE gets very inconsistent results when animating elements
					// with small values, which is common for padding
					if (settings.prop == 'height') {
						percentDone = (settings.now - settings.start) / (settings.end - settings.start);
					}
					
					options.toShow[0].style[settings.prop] =
						(percentDone * showProps[settings.prop].value) + showProps[settings.prop].unit;
				},
				duration: options.duration,
				easing: options.easing,
				complete: function() {
					if ( !options.autoHeight ) {
						options.toShow.css("height", "");
					}
					options.toShow.css("width", originalWidth);
					options.toShow.css({overflow: overflow});
					options.complete();
				}
			});
		},
		bounceslide: function(options) {
			this.slide(options, {
				easing: options.down ? "easeOutBounce" : "swing",
				duration: options.down ? 1000 : 200
			});
		},
		easeslide: function(options) {
			this.slide(options, {
				easing: "easeinout",
				duration: 700
			});
		}
	}
});

})(jQuery);
/*
 * jQuery UI Dialog 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Dialog
 *
 * Depends:
 *	ui.core.js
 *	ui.draggable.js
 *	ui.resizable.js
 */
(function($) {

var setDataSwitch = {
		dragStart: "start.draggable",
		drag: "drag.draggable",
		dragStop: "stop.draggable",
		maxHeight: "maxHeight.resizable",
		minHeight: "minHeight.resizable",
		maxWidth: "maxWidth.resizable",
		minWidth: "minWidth.resizable",
		resizeStart: "start.resizable",
		resize: "drag.resizable",
		resizeStop: "stop.resizable"
	},
	
	uiDialogClasses =
		'ui-dialog ' +
		'ui-widget ' +
		'ui-widget-content ' +
		'ui-corner-all ';

$.widget("ui.dialog", {

	_init: function() {
		this.originalTitle = this.element.attr('title');

		var self = this,
			options = this.options,

			title = options.title || this.originalTitle || '&nbsp;',
			titleId = $.ui.dialog.getTitleId(this.element),

			uiDialog = (this.uiDialog = $('<div/>'))
				.appendTo(document.body)
				.hide()
				.addClass(uiDialogClasses + options.dialogClass)
				.css({
					position: 'absolute',
					overflow: 'hidden',
					zIndex: options.zIndex
				})
				// setting tabIndex makes the div focusable
				// setting outline to 0 prevents a border on focus in Mozilla
				.attr('tabIndex', -1).css('outline', 0).keydown(function(event) {
					(options.closeOnEscape && event.keyCode
						&& event.keyCode == $.ui.keyCode.ESCAPE && self.close(event));
				})
				.attr({
					role: 'dialog',
					'aria-labelledby': titleId
				})
				.mousedown(function(event) {
					self.moveToTop(false, event);
				}),

			uiDialogContent = this.element
				.show()
				.removeAttr('title')
				.addClass(
					'ui-dialog-content ' +
					'ui-widget-content')
				.appendTo(uiDialog),

			uiDialogTitlebar = (this.uiDialogTitlebar = $('<div></div>'))
				.addClass(
					'ui-dialog-titlebar ' +
					'ui-widget-header ' +
					'ui-corner-all ' +
					'ui-helper-clearfix'
				)
				.prependTo(uiDialog),

			uiDialogTitlebarClose = $('<a href="#"/>')
				.addClass(
					'ui-dialog-titlebar-close ' +
					'ui-corner-all'
				)
				.attr('role', 'button')
				.hover(
					function() {
						uiDialogTitlebarClose.addClass('ui-state-hover');
					},
					function() {
						uiDialogTitlebarClose.removeClass('ui-state-hover');
					}
				)
				.focus(function() {
					uiDialogTitlebarClose.addClass('ui-state-focus');
				})
				.blur(function() {
					uiDialogTitlebarClose.removeClass('ui-state-focus');
				})
				.mousedown(function(ev) {
					ev.stopPropagation();
				})
				.click(function(event) {
					self.close(event);
					return false;
				})
				.appendTo(uiDialogTitlebar),

			uiDialogTitlebarCloseText = (this.uiDialogTitlebarCloseText = $('<span/>'))
				.addClass(
					'ui-icon ' +
					'ui-icon-closethick'
				)
				.text(options.closeText)
				.appendTo(uiDialogTitlebarClose),

			uiDialogTitle = $('<span/>')
				.addClass('ui-dialog-title')
				.attr('id', titleId)
				.html(title)
				.prependTo(uiDialogTitlebar);

		uiDialogTitlebar.find("*").add(uiDialogTitlebar).disableSelection();

		(options.draggable && $.fn.draggable && this._makeDraggable());
		(options.resizable && $.fn.resizable && this._makeResizable());

		this._createButtons(options.buttons);
		this._isOpen = false;

		(options.bgiframe && $.fn.bgiframe && uiDialog.bgiframe());
		(options.autoOpen && this.open());
		
	},

	destroy: function() {
		(this.overlay && this.overlay.destroy());
		this.uiDialog.hide();
		this.element
			.unbind('.dialog')
			.removeData('dialog')
			.removeClass('ui-dialog-content ui-widget-content')
			.hide().appendTo('body');
		this.uiDialog.remove();

		(this.originalTitle && this.element.attr('title', this.originalTitle));
	},

	close: function(event) {
		var self = this;
		
		if (false === self._trigger('beforeclose', event)) {
			return;
		}

		(self.overlay && self.overlay.destroy());
		self.uiDialog.unbind('keypress.ui-dialog');

		(self.options.hide
			? self.uiDialog.hide(self.options.hide, function() {
				self._trigger('close', event);
			})
			: self.uiDialog.hide() && self._trigger('close', event));

		$.ui.dialog.overlay.resize();

		self._isOpen = false;
	},

	isOpen: function() {
		return this._isOpen;
	},

	// the force parameter allows us to move modal dialogs to their correct
	// position on open
	moveToTop: function(force, event) {

		if ((this.options.modal && !force)
			|| (!this.options.stack && !this.options.modal)) {
			return this._trigger('focus', event);
		}
		
		if (this.options.zIndex > $.ui.dialog.maxZ) {
			$.ui.dialog.maxZ = this.options.zIndex;
		}
		(this.overlay && this.overlay.$el.css('z-index', $.ui.dialog.overlay.maxZ = ++$.ui.dialog.maxZ));

		//Save and then restore scroll since Opera 9.5+ resets when parent z-Index is changed.
		//  http://ui.jquery.com/bugs/ticket/3193
		var saveScroll = { scrollTop: this.element.attr('scrollTop'), scrollLeft: this.element.attr('scrollLeft') };
		this.uiDialog.css('z-index', ++$.ui.dialog.maxZ);
		this.element.attr(saveScroll);
		this._trigger('focus', event);
	},

	open: function() {
		if (this._isOpen) { return; }

		var options = this.options,
			uiDialog = this.uiDialog;

		this.overlay = options.modal ? new $.ui.dialog.overlay(this) : null;
		(uiDialog.next().length && uiDialog.appendTo('body'));
		this._size();
		this._position(options.position);
		uiDialog.show(options.show);
		this.moveToTop(true);

		// prevent tabbing out of modal dialogs
		(options.modal && uiDialog.bind('keypress.ui-dialog', function(event) {
			if (event.keyCode != $.ui.keyCode.TAB) {
				return;
			}

			var tabbables = $(':tabbable', this),
				first = tabbables.filter(':first')[0],
				last  = tabbables.filter(':last')[0];

			if (event.target == last && !event.shiftKey) {
				setTimeout(function() {
					first.focus();
				}, 1);
			} else if (event.target == first && event.shiftKey) {
				setTimeout(function() {
					last.focus();
				}, 1);
			}
		}));

		// set focus to the first tabbable element in the content area or the first button
		// if there are no tabbable elements, set focus on the dialog itself
		$([])
			.add(uiDialog.find('.ui-dialog-content :tabbable:first'))
			.add(uiDialog.find('.ui-dialog-buttonpane :tabbable:first'))
			.add(uiDialog)
			.filter(':first')
			.focus();

		this._trigger('open');
		this._isOpen = true;
	},

	_createButtons: function(buttons) {
		var self = this,
			hasButtons = false,
			uiDialogButtonPane = $('<div></div>')
				.addClass(
					'ui-dialog-buttonpane ' +
					'ui-widget-content ' +
					'ui-helper-clearfix'
				);

		// if we already have a button pane, remove it
		this.uiDialog.find('.ui-dialog-buttonpane').remove();

		(typeof buttons == 'object' && buttons !== null &&
			$.each(buttons, function() { return !(hasButtons = true); }));
		if (hasButtons) {
			$.each(buttons, function(name, fn) {
				$('<button type="button"></button>')
					.addClass(
						'ui-state-default ' +
						'ui-corner-all'
					)
					.text(name)
					.click(function() { fn.apply(self.element[0], arguments); })
					.hover(
						function() {
							$(this).addClass('ui-state-hover');
						},
						function() {
							$(this).removeClass('ui-state-hover');
						}
					)
					.focus(function() {
						$(this).addClass('ui-state-focus');
					})
					.blur(function() {
						$(this).removeClass('ui-state-focus');
					})
					.appendTo(uiDialogButtonPane);
			});
			uiDialogButtonPane.appendTo(this.uiDialog);
		}
	},

	_makeDraggable: function() {
		var self = this,
			options = this.options,
			heightBeforeDrag;

		this.uiDialog.draggable({
			cancel: '.ui-dialog-content',
			handle: '.ui-dialog-titlebar',
			containment: 'document',
			start: function() {
				heightBeforeDrag = options.height;
				$(this).height($(this).height()).addClass("ui-dialog-dragging");
				(options.dragStart && options.dragStart.apply(self.element[0], arguments));
			},
			drag: function() {
				(options.drag && options.drag.apply(self.element[0], arguments));
			},
			stop: function() {
				$(this).removeClass("ui-dialog-dragging").height(heightBeforeDrag);
				(options.dragStop && options.dragStop.apply(self.element[0], arguments));
				$.ui.dialog.overlay.resize();
			}
		});
	},

	_makeResizable: function(handles) {
		handles = (handles === undefined ? this.options.resizable : handles);
		var self = this,
			options = this.options,
			resizeHandles = typeof handles == 'string'
				? handles
				: 'n,e,s,w,se,sw,ne,nw';

		this.uiDialog.resizable({
			cancel: '.ui-dialog-content',
			alsoResize: this.element,
			maxWidth: options.maxWidth,
			maxHeight: options.maxHeight,
			minWidth: options.minWidth,
			minHeight: options.minHeight,
			start: function() {
				$(this).addClass("ui-dialog-resizing");
				(options.resizeStart && options.resizeStart.apply(self.element[0], arguments));
			},
			resize: function() {
				(options.resize && options.resize.apply(self.element[0], arguments));
			},
			handles: resizeHandles,
			stop: function() {
				$(this).removeClass("ui-dialog-resizing");
				options.height = $(this).height();
				options.width = $(this).width();
				(options.resizeStop && options.resizeStop.apply(self.element[0], arguments));
				$.ui.dialog.overlay.resize();
			}
		})
		.find('.ui-resizable-se').addClass('ui-icon ui-icon-grip-diagonal-se');
	},

	_position: function(pos) {
		var wnd = $(window), doc = $(document),
			pTop = doc.scrollTop(), pLeft = doc.scrollLeft(),
			minTop = pTop;

		if ($.inArray(pos, ['center','top','right','bottom','left']) >= 0) {
			pos = [
				pos == 'right' || pos == 'left' ? pos : 'center',
				pos == 'top' || pos == 'bottom' ? pos : 'middle'
			];
		}
		if (pos.constructor != Array) {
			pos = ['center', 'middle'];
		}
		if (pos[0].constructor == Number) {
			pLeft += pos[0];
		} else {
			switch (pos[0]) {
				case 'left':
					pLeft += 0;
					break;
				case 'right':
					pLeft += wnd.width() - this.uiDialog.outerWidth();
					break;
				default:
				case 'center':
					pLeft += (wnd.width() - this.uiDialog.outerWidth()) / 2;
			}
		}
		if (pos[1].constructor == Number) {
			pTop += pos[1];
		} else {
			switch (pos[1]) {
				case 'top':
					pTop += 0;
					break;
				case 'bottom':
					pTop += wnd.height() - this.uiDialog.outerHeight();
					break;
				default:
				case 'middle':
					pTop += (wnd.height() - this.uiDialog.outerHeight()) / 2;
			}
		}

		// prevent the dialog from being too high (make sure the titlebar
		// is accessible)
		pTop = Math.max(pTop, minTop);
		this.uiDialog.css({top: pTop, left: pLeft});
	},

	_setData: function(key, value){
		(setDataSwitch[key] && this.uiDialog.data(setDataSwitch[key], value));
		switch (key) {
			case "buttons":
				this._createButtons(value);
				break;
			case "closeText":
				this.uiDialogTitlebarCloseText.text(value);
				break;
			case "dialogClass":
				this.uiDialog
					.removeClass(this.options.dialogClass)
					.addClass(uiDialogClasses + value);
				break;
			case "draggable":
				(value
					? this._makeDraggable()
					: this.uiDialog.draggable('destroy'));
				break;
			case "height":
				this.uiDialog.height(value);
				break;
			case "position":
				this._position(value);
				break;
			case "resizable":
				var uiDialog = this.uiDialog,
					isResizable = this.uiDialog.is(':data(resizable)');

				// currently resizable, becoming non-resizable
				(isResizable && !value && uiDialog.resizable('destroy'));

				// currently resizable, changing handles
				(isResizable && typeof value == 'string' &&
					uiDialog.resizable('option', 'handles', value));

				// currently non-resizable, becoming resizable
				(isResizable || this._makeResizable(value));
				break;
			case "title":
				$(".ui-dialog-title", this.uiDialogTitlebar).html(value || '&nbsp;');
				break;
			case "width":
				this.uiDialog.width(value);
				break;
		}

		$.widget.prototype._setData.apply(this, arguments);
	},

	_size: function() {
		/* If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
		 * divs will both have width and height set, so we need to reset them
		 */
		var options = this.options;

		// reset content sizing
		this.element.css({
			height: 0,
			minHeight: 0,
			width: 'auto'
		});

		// reset wrapper sizing
		// determine the height of all the non-content elements
		var nonContentHeight = this.uiDialog.css({
				height: 'auto',
				width: options.width
			})
			.height();

		this.element
			.css({
				minHeight: Math.max(options.minHeight - nonContentHeight, 0),
				height: options.height == 'auto'
					? 'auto'
					: Math.max(options.height - nonContentHeight, 0)
			});
	}
});

$.extend($.ui.dialog, {
	version: "1.7.1",
	defaults: {
		autoOpen: true,
		bgiframe: false,
		buttons: {},
		closeOnEscape: true,
		closeText: 'close',
		dialogClass: '',
		draggable: true,
		hide: null,
		height: 'auto',
		maxHeight: false,
		maxWidth: false,
		minHeight: 150,
		minWidth: 150,
		modal: false,
		position: 'center',
		resizable: true,
		show: null,
		stack: true,
		title: '',
		width: 300,
		zIndex: 1000
	},

	getter: 'isOpen',

	uuid: 0,
	maxZ: 0,

	getTitleId: function($el) {
		return 'ui-dialog-title-' + ($el.attr('id') || ++this.uuid);
	},

	overlay: function(dialog) {
		this.$el = $.ui.dialog.overlay.create(dialog);
	}
});

$.extend($.ui.dialog.overlay, {
	instances: [],
	maxZ: 0,
	events: $.map('focus,mousedown,mouseup,keydown,keypress,click'.split(','),
		function(event) { return event + '.dialog-overlay'; }).join(' '),
	create: function(dialog) {
		if (this.instances.length === 0) {
			// prevent use of anchors and inputs
			// we use a setTimeout in case the overlay is created from an
			// event that we're going to be cancelling (see #2804)
			setTimeout(function() {
				$(document).bind($.ui.dialog.overlay.events, function(event) {
					var dialogZ = $(event.target).parents('.ui-dialog').css('zIndex') || 0;
					return (dialogZ > $.ui.dialog.overlay.maxZ);
				});
			}, 1);

			// allow closing by pressing the escape key
			$(document).bind('keydown.dialog-overlay', function(event) {
				(dialog.options.closeOnEscape && event.keyCode
						&& event.keyCode == $.ui.keyCode.ESCAPE && dialog.close(event));
			});

			// handle window resize
			$(window).bind('resize.dialog-overlay', $.ui.dialog.overlay.resize);
		}

		var $el = $('<div></div>').appendTo(document.body)
			.addClass('ui-widget-overlay').css({
				width: this.width(),
				height: this.height()
			});

		(dialog.options.bgiframe && $.fn.bgiframe && $el.bgiframe());

		this.instances.push($el);
		return $el;
	},

	destroy: function($el) {
		this.instances.splice($.inArray(this.instances, $el), 1);

		if (this.instances.length === 0) {
			$([document, window]).unbind('.dialog-overlay');
		}

		$el.remove();
	},

	height: function() {
		// handle IE 6
		if ($.browser.msie && $.browser.version < 7) {
			var scrollHeight = Math.max(
				document.documentElement.scrollHeight,
				document.body.scrollHeight
			);
			var offsetHeight = Math.max(
				document.documentElement.offsetHeight,
				document.body.offsetHeight
			);

			if (scrollHeight < offsetHeight) {
				return $(window).height() + 'px';
			} else {
				return scrollHeight + 'px';
			}
		// handle "good" browsers
		} else {
			return $(document).height() + 'px';
		}
	},

	width: function() {
		// handle IE 6
		if ($.browser.msie && $.browser.version < 7) {
			var scrollWidth = Math.max(
				document.documentElement.scrollWidth,
				document.body.scrollWidth
			);
			var offsetWidth = Math.max(
				document.documentElement.offsetWidth,
				document.body.offsetWidth
			);

			if (scrollWidth < offsetWidth) {
				return $(window).width() + 'px';
			} else {
				return scrollWidth + 'px';
			}
		// handle "good" browsers
		} else {
			return $(document).width() + 'px';
		}
	},

	resize: function() {
		/* If the dialog is draggable and the user drags it past the
		 * right edge of the window, the document becomes wider so we
		 * need to stretch the overlay. If the user then drags the
		 * dialog back to the left, the document will become narrower,
		 * so we need to shrink the overlay to the appropriate size.
		 * This is handled by shrinking the overlay before setting it
		 * to the full document size.
		 */
		var $overlays = $([]);
		$.each($.ui.dialog.overlay.instances, function() {
			$overlays = $overlays.add(this);
		});

		$overlays.css({
			width: 0,
			height: 0
		}).css({
			width: $.ui.dialog.overlay.width(),
			height: $.ui.dialog.overlay.height()
		});
	}
});

$.extend($.ui.dialog.overlay.prototype, {
	destroy: function() {
		$.ui.dialog.overlay.destroy(this.$el);
	}
});

})(jQuery);
/*
 * jQuery UI Slider 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Slider
 *
 * Depends:
 *	ui.core.js
 */

(function($) {

$.widget("ui.slider", $.extend({}, $.ui.mouse, {

	_init: function() {

		var self = this, o = this.options;
		this._keySliding = false;
		this._handleIndex = null;
		this._detectOrientation();
		this._mouseInit();

		this.element
			.addClass("ui-slider"
				+ " ui-slider-" + this.orientation
				+ " ui-widget"
				+ " ui-widget-content"
				+ " ui-corner-all");

		this.range = $([]);

		if (o.range) {

			if (o.range === true) {
				this.range = $('<div></div>');
				if (!o.values) o.values = [this._valueMin(), this._valueMin()];
				if (o.values.length && o.values.length != 2) {
					o.values = [o.values[0], o.values[0]];
				}
			} else {
				this.range = $('<div></div>');
			}

			this.range
				.appendTo(this.element)
				.addClass("ui-slider-range");

			if (o.range == "min" || o.range == "max") {
				this.range.addClass("ui-slider-range-" + o.range);
			}

			// note: this isn't the most fittingly semantic framework class for this element,
			// but worked best visually with a variety of themes
			this.range.addClass("ui-widget-header");

		}

		if ($(".ui-slider-handle", this.element).length == 0)
			$('<a href="#"></a>')
				.appendTo(this.element)
				.addClass("ui-slider-handle");

		if (o.values && o.values.length) {
			while ($(".ui-slider-handle", this.element).length < o.values.length)
				$('<a href="#"></a>')
					.appendTo(this.element)
					.addClass("ui-slider-handle");
		}

		this.handles = $(".ui-slider-handle", this.element)
			.addClass("ui-state-default"
				+ " ui-corner-all");

		this.handle = this.handles.eq(0);

		this.handles.add(this.range).filter("a")
			.click(function(event) { event.preventDefault(); })
			.hover(function() { $(this).addClass('ui-state-hover'); }, function() { $(this).removeClass('ui-state-hover'); })
			.focus(function() { $(".ui-slider .ui-state-focus").removeClass('ui-state-focus'); $(this).addClass('ui-state-focus'); })
			.blur(function() { $(this).removeClass('ui-state-focus'); });

		this.handles.each(function(i) {
			$(this).data("index.ui-slider-handle", i);
		});

		this.handles.keydown(function(event) {

			var ret = true;

			var index = $(this).data("index.ui-slider-handle");

			if (self.options.disabled)
				return;

			switch (event.keyCode) {
				case $.ui.keyCode.HOME:
				case $.ui.keyCode.END:
				case $.ui.keyCode.UP:
				case $.ui.keyCode.RIGHT:
				case $.ui.keyCode.DOWN:
				case $.ui.keyCode.LEFT:
					ret = false;
					if (!self._keySliding) {
						self._keySliding = true;
						$(this).addClass("ui-state-active");
						self._start(event, index);
					}
					break;
			}

			var curVal, newVal, step = self._step();
			if (self.options.values && self.options.values.length) {
				curVal = newVal = self.values(index);
			} else {
				curVal = newVal = self.value();
			}

			switch (event.keyCode) {
				case $.ui.keyCode.HOME:
					newVal = self._valueMin();
					break;
				case $.ui.keyCode.END:
					newVal = self._valueMax();
					break;
				case $.ui.keyCode.UP:
				case $.ui.keyCode.RIGHT:
					if(curVal == self._valueMax()) return;
					newVal = curVal + step;
					break;
				case $.ui.keyCode.DOWN:
				case $.ui.keyCode.LEFT:
					if(curVal == self._valueMin()) return;
					newVal = curVal - step;
					break;
			}

			self._slide(event, index, newVal);

			return ret;

		}).keyup(function(event) {

			var index = $(this).data("index.ui-slider-handle");

			if (self._keySliding) {
				self._stop(event, index);
				self._change(event, index);
				self._keySliding = false;
				$(this).removeClass("ui-state-active");
			}

		});

		this._refreshValue();

	},

	destroy: function() {

		this.handles.remove();
		this.range.remove();

		this.element
			.removeClass("ui-slider"
				+ " ui-slider-horizontal"
				+ " ui-slider-vertical"
				+ " ui-slider-disabled"
				+ " ui-widget"
				+ " ui-widget-content"
				+ " ui-corner-all")
			.removeData("slider")
			.unbind(".slider");

		this._mouseDestroy();

	},

	_mouseCapture: function(event) {

		var o = this.options;

		if (o.disabled)
			return false;

		this.elementSize = {
			width: this.element.outerWidth(),
			height: this.element.outerHeight()
		};
		this.elementOffset = this.element.offset();

		var position = { x: event.pageX, y: event.pageY };
		var normValue = this._normValueFromMouse(position);

		var distance = this._valueMax() - this._valueMin() + 1, closestHandle;
		var self = this, index;
		this.handles.each(function(i) {
			var thisDistance = Math.abs(normValue - self.values(i));
			if (distance > thisDistance) {
				distance = thisDistance;
				closestHandle = $(this);
				index = i;
			}
		});

		// workaround for bug #3736 (if both handles of a range are at 0,
		// the first is always used as the one with least distance,
		// and moving it is obviously prevented by preventing negative ranges)
		if(o.range == true && this.values(1) == o.min) {
			closestHandle = $(this.handles[++index]);
		}

		this._start(event, index);

		self._handleIndex = index;

		closestHandle
			.addClass("ui-state-active")
			.focus();
		
		var offset = closestHandle.offset();
		var mouseOverHandle = !$(event.target).parents().andSelf().is('.ui-slider-handle');
		this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
			left: event.pageX - offset.left - (closestHandle.width() / 2),
			top: event.pageY - offset.top
				- (closestHandle.height() / 2)
				- (parseInt(closestHandle.css('borderTopWidth'),10) || 0)
				- (parseInt(closestHandle.css('borderBottomWidth'),10) || 0)
				+ (parseInt(closestHandle.css('marginTop'),10) || 0)
		};

		normValue = this._normValueFromMouse(position);
		this._slide(event, index, normValue);
		return true;

	},

	_mouseStart: function(event) {
		return true;
	},

	_mouseDrag: function(event) {

		var position = { x: event.pageX, y: event.pageY };
		var normValue = this._normValueFromMouse(position);
		
		this._slide(event, this._handleIndex, normValue);

		return false;

	},

	_mouseStop: function(event) {

		this.handles.removeClass("ui-state-active");
		this._stop(event, this._handleIndex);
		this._change(event, this._handleIndex);
		this._handleIndex = null;
		this._clickOffset = null;

		return false;

	},
	
	_detectOrientation: function() {
		this.orientation = this.options.orientation == 'vertical' ? 'vertical' : 'horizontal';
	},

	_normValueFromMouse: function(position) {

		var pixelTotal, pixelMouse;
		if ('horizontal' == this.orientation) {
			pixelTotal = this.elementSize.width;
			pixelMouse = position.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0);
		} else {
			pixelTotal = this.elementSize.height;
			pixelMouse = position.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0);
		}

		var percentMouse = (pixelMouse / pixelTotal);
		if (percentMouse > 1) percentMouse = 1;
		if (percentMouse < 0) percentMouse = 0;
		if ('vertical' == this.orientation)
			percentMouse = 1 - percentMouse;

		var valueTotal = this._valueMax() - this._valueMin(),
			valueMouse = percentMouse * valueTotal,
			valueMouseModStep = valueMouse % this.options.step,
			normValue = this._valueMin() + valueMouse - valueMouseModStep;

		if (valueMouseModStep > (this.options.step / 2))
			normValue += this.options.step;

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see #4124)
		return parseFloat(normValue.toFixed(5));

	},

	_start: function(event, index) {
		var uiHash = {
			handle: this.handles[index],
			value: this.value()
		};
		if (this.options.values && this.options.values.length) {
			uiHash.value = this.values(index)
			uiHash.values = this.values()
		}
		this._trigger("start", event, uiHash);
	},

	_slide: function(event, index, newVal) {

		var handle = this.handles[index];

		if (this.options.values && this.options.values.length) {

			var otherVal = this.values(index ? 0 : 1);

			if ((index == 0 && newVal >= otherVal) || (index == 1 && newVal <= otherVal))
				newVal = otherVal;

			if (newVal != this.values(index)) {
				var newValues = this.values();
				newValues[index] = newVal;
				// A slide can be canceled by returning false from the slide callback
				var allowed = this._trigger("slide", event, {
					handle: this.handles[index],
					value: newVal,
					values: newValues
				});
				var otherVal = this.values(index ? 0 : 1);
				if (allowed !== false) {
					this.values(index, newVal, ( event.type == 'mousedown' && this.options.animate ), true);
				}
			}

		} else {

			if (newVal != this.value()) {
				// A slide can be canceled by returning false from the slide callback
				var allowed = this._trigger("slide", event, {
					handle: this.handles[index],
					value: newVal
				});
				if (allowed !== false) {
					this._setData('value', newVal, ( event.type == 'mousedown' && this.options.animate ));
				}
					
			}

		}

	},

	_stop: function(event, index) {
		var uiHash = {
			handle: this.handles[index],
			value: this.value()
		};
		if (this.options.values && this.options.values.length) {
			uiHash.value = this.values(index)
			uiHash.values = this.values()
		}
		this._trigger("stop", event, uiHash);
	},

	_change: function(event, index) {
		var uiHash = {
			handle: this.handles[index],
			value: this.value()
		};
		if (this.options.values && this.options.values.length) {
			uiHash.value = this.values(index)
			uiHash.values = this.values()
		}
		this._trigger("change", event, uiHash);
	},

	value: function(newValue) {

		if (arguments.length) {
			this._setData("value", newValue);
			this._change(null, 0);
		}

		return this._value();

	},

	values: function(index, newValue, animated, noPropagation) {

		if (arguments.length > 1) {
			this.options.values[index] = newValue;
			this._refreshValue(animated);
			if(!noPropagation) this._change(null, index);
		}

		if (arguments.length) {
			if (this.options.values && this.options.values.length) {
				return this._values(index);
			} else {
				return this.value();
			}
		} else {
			return this._values();
		}

	},

	_setData: function(key, value, animated) {

		$.widget.prototype._setData.apply(this, arguments);

		switch (key) {
			case 'orientation':

				this._detectOrientation();
				
				this.element
					.removeClass("ui-slider-horizontal ui-slider-vertical")
					.addClass("ui-slider-" + this.orientation);
				this._refreshValue(animated);
				break;
			case 'value':
				this._refreshValue(animated);
				break;
		}

	},

	_step: function() {
		var step = this.options.step;
		return step;
	},

	_value: function() {

		var val = this.options.value;
		if (val < this._valueMin()) val = this._valueMin();
		if (val > this._valueMax()) val = this._valueMax();

		return val;

	},

	_values: function(index) {

		if (arguments.length) {
			var val = this.options.values[index];
			if (val < this._valueMin()) val = this._valueMin();
			if (val > this._valueMax()) val = this._valueMax();

			return val;
		} else {
			return this.options.values;
		}

	},

	_valueMin: function() {
		var valueMin = this.options.min;
		return valueMin;
	},

	_valueMax: function() {
		var valueMax = this.options.max;
		return valueMax;
	},

	_refreshValue: function(animate) {

		var oRange = this.options.range, o = this.options, self = this;

		if (this.options.values && this.options.values.length) {
			var vp0, vp1;
			this.handles.each(function(i, j) {
				var valPercent = (self.values(i) - self._valueMin()) / (self._valueMax() - self._valueMin()) * 100;
				var _set = {}; _set[self.orientation == 'horizontal' ? 'left' : 'bottom'] = valPercent + '%';
				$(this).stop(1,1)[animate ? 'animate' : 'css'](_set, o.animate);
				if (self.options.range === true) {
					if (self.orientation == 'horizontal') {
						(i == 0) && self.range.stop(1,1)[animate ? 'animate' : 'css']({ left: valPercent + '%' }, o.animate);
						(i == 1) && self.range[animate ? 'animate' : 'css']({ width: (valPercent - lastValPercent) + '%' }, { queue: false, duration: o.animate });
					} else {
						(i == 0) && self.range.stop(1,1)[animate ? 'animate' : 'css']({ bottom: (valPercent) + '%' }, o.animate);
						(i == 1) && self.range[animate ? 'animate' : 'css']({ height: (valPercent - lastValPercent) + '%' }, { queue: false, duration: o.animate });
					}
				}
				lastValPercent = valPercent;
			});
		} else {
			var value = this.value(),
				valueMin = this._valueMin(),
				valueMax = this._valueMax(),
				valPercent = valueMax != valueMin
					? (value - valueMin) / (valueMax - valueMin) * 100
					: 0;
			var _set = {}; _set[self.orientation == 'horizontal' ? 'left' : 'bottom'] = valPercent + '%';
			this.handle.stop(1,1)[animate ? 'animate' : 'css'](_set, o.animate);

			(oRange == "min") && (this.orientation == "horizontal") && this.range.stop(1,1)[animate ? 'animate' : 'css']({ width: valPercent + '%' }, o.animate);
			(oRange == "max") && (this.orientation == "horizontal") && this.range[animate ? 'animate' : 'css']({ width: (100 - valPercent) + '%' }, { queue: false, duration: o.animate });
			(oRange == "min") && (this.orientation == "vertical") && this.range.stop(1,1)[animate ? 'animate' : 'css']({ height: valPercent + '%' }, o.animate);
			(oRange == "max") && (this.orientation == "vertical") && this.range[animate ? 'animate' : 'css']({ height: (100 - valPercent) + '%' }, { queue: false, duration: o.animate });
		}

	}
	
}));

$.extend($.ui.slider, {
	getter: "value values",
	version: "1.7.1",
	eventPrefix: "slide",
	defaults: {
		animate: false,
		delay: 0,
		distance: 0,
		max: 100,
		min: 0,
		orientation: 'horizontal',
		range: false,
		step: 1,
		value: 0,
		values: null
	}
});

})(jQuery);
/*
 * jQuery UI Tabs 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Tabs
 *
 * Depends:
 *	ui.core.js
 */
(function($) {

$.widget("ui.tabs", {

	_init: function() {
		if (this.options.deselectable !== undefined) {
			this.options.collapsible = this.options.deselectable;
		}
		this._tabify(true);
	},

	_setData: function(key, value) {
		if (key == 'selected') {
			if (this.options.collapsible && value == this.options.selected) {
				return;
			}
			this.select(value);
		}
		else {
			this.options[key] = value;
			if (key == 'deselectable') {
				this.options.collapsible = value;
			}
			this._tabify();
		}
	},

	_tabId: function(a) {
		return a.title && a.title.replace(/\s/g, '_').replace(/[^A-Za-z0-9\-_:\.]/g, '') ||
			this.options.idPrefix + $.data(a);
	},

	_sanitizeSelector: function(hash) {
		return hash.replace(/:/g, '\\:'); // we need this because an id may contain a ":"
	},

	_cookie: function() {
		var cookie = this.cookie || (this.cookie = this.options.cookie.name || 'ui-tabs-' + $.data(this.list[0]));
		return $.cookie.apply(null, [cookie].concat($.makeArray(arguments)));
	},

	_ui: function(tab, panel) {
		return {
			tab: tab,
			panel: panel,
			index: this.anchors.index(tab)
		};
	},

	_cleanup: function() {
		// restore all former loading tabs labels
		this.lis.filter('.ui-state-processing').removeClass('ui-state-processing')
				.find('span:data(label.tabs)')
				.each(function() {
					var el = $(this);
					el.html(el.data('label.tabs')).removeData('label.tabs');
				});
	},

	_tabify: function(init) {

		this.list = this.element.children('ul:first');
		this.lis = $('li:has(a[href])', this.list);
		this.anchors = this.lis.map(function() { return $('a', this)[0]; });
		this.panels = $([]);

		var self = this, o = this.options;

		var fragmentId = /^#.+/; // Safari 2 reports '#' for an empty hash
		this.anchors.each(function(i, a) {
			var href = $(a).attr('href');

			// For dynamically created HTML that contains a hash as href IE < 8 expands
			// such href to the full page url with hash and then misinterprets tab as ajax.
			// Same consideration applies for an added tab with a fragment identifier
			// since a[href=#fragment-identifier] does unexpectedly not match.
			// Thus normalize href attribute...
			var hrefBase = href.split('#')[0], baseEl;
			if (hrefBase && (hrefBase === location.toString().split('#')[0] ||
					(baseEl = $('base')[0]) && hrefBase === baseEl.href)) {
				href = a.hash;
				a.href = href;
			}

			// inline tab
			if (fragmentId.test(href)) {
				self.panels = self.panels.add(self._sanitizeSelector(href));
			}

			// remote tab
			else if (href != '#') { // prevent loading the page itself if href is just "#"
				$.data(a, 'href.tabs', href); // required for restore on destroy

				// TODO until #3808 is fixed strip fragment identifier from url
				// (IE fails to load from such url)
				$.data(a, 'load.tabs', href.replace(/#.*$/, '')); // mutable data

				var id = self._tabId(a);
				a.href = '#' + id;
				var $panel = $('#' + id);
				if (!$panel.length) {
					$panel = $(o.panelTemplate).attr('id', id).addClass('ui-tabs-panel ui-widget-content ui-corner-bottom')
						.insertAfter(self.panels[i - 1] || self.list);
					$panel.data('destroy.tabs', true);
				}
				self.panels = self.panels.add($panel);
			}

			// invalid tab href
			else {
				o.disabled.push(i);
			}
		});

		// initialization from scratch
		if (init) {

			// attach necessary classes for styling
			this.element.addClass('ui-tabs ui-widget ui-widget-content ui-corner-all');
			this.list.addClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all');
			this.lis.addClass('ui-state-default ui-corner-top');
			this.panels.addClass('ui-tabs-panel ui-widget-content ui-corner-bottom');

			// Selected tab
			// use "selected" option or try to retrieve:
			// 1. from fragment identifier in url
			// 2. from cookie
			// 3. from selected class attribute on <li>
			if (o.selected === undefined) {
				if (location.hash) {
					this.anchors.each(function(i, a) {
						if (a.hash == location.hash) {
							o.selected = i;
							return false; // break
						}
					});
				}
				if (typeof o.selected != 'number' && o.cookie) {
					o.selected = parseInt(self._cookie(), 10);
				}
				if (typeof o.selected != 'number' && this.lis.filter('.ui-tabs-selected').length) {
					o.selected = this.lis.index(this.lis.filter('.ui-tabs-selected'));
				}
				o.selected = o.selected || 0;
			}
			else if (o.selected === null) { // usage of null is deprecated, TODO remove in next release
				o.selected = -1;
			}

			// sanity check - default to first tab...
			o.selected = ((o.selected >= 0 && this.anchors[o.selected]) || o.selected < 0) ? o.selected : 0;

			// Take disabling tabs via class attribute from HTML
			// into account and update option properly.
			// A selected tab cannot become disabled.
			o.disabled = $.unique(o.disabled.concat(
				$.map(this.lis.filter('.ui-state-disabled'),
					function(n, i) { return self.lis.index(n); } )
			)).sort();

			if ($.inArray(o.selected, o.disabled) != -1) {
				o.disabled.splice($.inArray(o.selected, o.disabled), 1);
			}

			// highlight selected tab
			this.panels.addClass('ui-tabs-hide');
			this.lis.removeClass('ui-tabs-selected ui-state-active');
			if (o.selected >= 0 && this.anchors.length) { // check for length avoids error when initializing empty list
				this.panels.eq(o.selected).removeClass('ui-tabs-hide');
				this.lis.eq(o.selected).addClass('ui-tabs-selected ui-state-active');

				// seems to be expected behavior that the show callback is fired
				self.element.queue("tabs", function() {
					self._trigger('show', null, self._ui(self.anchors[o.selected], self.panels[o.selected]));
				});
				
				this.load(o.selected);
			}

			// clean up to avoid memory leaks in certain versions of IE 6
			$(window).bind('unload', function() {
				self.lis.add(self.anchors).unbind('.tabs');
				self.lis = self.anchors = self.panels = null;
			});

		}
		// update selected after add/remove
		else {
			o.selected = this.lis.index(this.lis.filter('.ui-tabs-selected'));
		}

		// update collapsible
		this.element[o.collapsible ? 'addClass' : 'removeClass']('ui-tabs-collapsible');

		// set or update cookie after init and add/remove respectively
		if (o.cookie) {
			this._cookie(o.selected, o.cookie);
		}

		// disable tabs
		for (var i = 0, li; (li = this.lis[i]); i++) {
			$(li)[$.inArray(i, o.disabled) != -1 &&
				!$(li).hasClass('ui-tabs-selected') ? 'addClass' : 'removeClass']('ui-state-disabled');
		}

		// reset cache if switching from cached to not cached
		if (o.cache === false) {
			this.anchors.removeData('cache.tabs');
		}

		// remove all handlers before, tabify may run on existing tabs after add or option change
		this.lis.add(this.anchors).unbind('.tabs');

		if (o.event != 'mouseover') {
			var addState = function(state, el) {
				if (el.is(':not(.ui-state-disabled)')) {
					el.addClass('ui-state-' + state);
				}
			};
			var removeState = function(state, el) {
				el.removeClass('ui-state-' + state);
			};
			this.lis.bind('mouseover.tabs', function() {
				addState('hover', $(this));
			});
			this.lis.bind('mouseout.tabs', function() {
				removeState('hover', $(this));
			});
			this.anchors.bind('focus.tabs', function() {
				addState('focus', $(this).closest('li'));
			});
			this.anchors.bind('blur.tabs', function() {
				removeState('focus', $(this).closest('li'));
			});
		}

		// set up animations
		var hideFx, showFx;
		if (o.fx) {
			if ($.isArray(o.fx)) {
				hideFx = o.fx[0];
				showFx = o.fx[1];
			}
			else {
				hideFx = showFx = o.fx;
			}
		}

		// Reset certain styles left over from animation
		// and prevent IE's ClearType bug...
		function resetStyle($el, fx) {
			$el.css({ display: '' });
			if ($.browser.msie && fx.opacity) {
				$el[0].style.removeAttribute('filter');
			}
		}

		// Show a tab...
		var showTab = showFx ?
			function(clicked, $show) {
				$(clicked).closest('li').removeClass('ui-state-default').addClass('ui-tabs-selected ui-state-active');
				$show.hide().removeClass('ui-tabs-hide') // avoid flicker that way
					.animate(showFx, showFx.duration || 'normal', function() {
						resetStyle($show, showFx);
						self._trigger('show', null, self._ui(clicked, $show[0]));
					});
			} :
			function(clicked, $show) {
				$(clicked).closest('li').removeClass('ui-state-default').addClass('ui-tabs-selected ui-state-active');
				$show.removeClass('ui-tabs-hide');
				self._trigger('show', null, self._ui(clicked, $show[0]));
			};

		// Hide a tab, $show is optional...
		var hideTab = hideFx ?
			function(clicked, $hide) {
				$hide.animate(hideFx, hideFx.duration || 'normal', function() {
					self.lis.removeClass('ui-tabs-selected ui-state-active').addClass('ui-state-default');
					$hide.addClass('ui-tabs-hide');
					resetStyle($hide, hideFx);
					self.element.dequeue("tabs");
				});
			} :
			function(clicked, $hide, $show) {
				self.lis.removeClass('ui-tabs-selected ui-state-active').addClass('ui-state-default');
				$hide.addClass('ui-tabs-hide');
				self.element.dequeue("tabs");
			};

		// attach tab event handler, unbind to avoid duplicates from former tabifying...
		this.anchors.bind(o.event + '.tabs', function() {
			var el = this, $li = $(this).closest('li'), $hide = self.panels.filter(':not(.ui-tabs-hide)'),
					$show = $(self._sanitizeSelector(this.hash));

			// If tab is already selected and not collapsible or tab disabled or
			// or is already loading or click callback returns false stop here.
			// Check if click handler returns false last so that it is not executed
			// for a disabled or loading tab!
			if (($li.hasClass('ui-tabs-selected') && !o.collapsible) ||
				$li.hasClass('ui-state-disabled') ||
				$li.hasClass('ui-state-processing') ||
				self._trigger('select', null, self._ui(this, $show[0])) === false) {
				this.blur();
				return false;
			}

			o.selected = self.anchors.index(this);

			self.abort();

			// if tab may be closed
			if (o.collapsible) {
				if ($li.hasClass('ui-tabs-selected')) {
					o.selected = -1;

					if (o.cookie) {
						self._cookie(o.selected, o.cookie);
					}

					self.element.queue("tabs", function() {
						hideTab(el, $hide);
					}).dequeue("tabs");
					
					this.blur();
					return false;
				}
				else if (!$hide.length) {
					if (o.cookie) {
						self._cookie(o.selected, o.cookie);
					}
					
					self.element.queue("tabs", function() {
						showTab(el, $show);
					});

					self.load(self.anchors.index(this)); // TODO make passing in node possible, see also http://dev.jqueryui.com/ticket/3171
					
					this.blur();
					return false;
				}
			}

			if (o.cookie) {
				self._cookie(o.selected, o.cookie);
			}

			// show new tab
			if ($show.length) {
				if ($hide.length) {
					self.element.queue("tabs", function() {
						hideTab(el, $hide);
					});
				}
				self.element.queue("tabs", function() {
					showTab(el, $show);
				});
				
				self.load(self.anchors.index(this));
			}
			else {
				throw 'jQuery UI Tabs: Mismatching fragment identifier.';
			}

			// Prevent IE from keeping other link focussed when using the back button
			// and remove dotted border from clicked link. This is controlled via CSS
			// in modern browsers; blur() removes focus from address bar in Firefox
			// which can become a usability and annoying problem with tabs('rotate').
			if ($.browser.msie) {
				this.blur();
			}

		});

		// disable click in any case
		this.anchors.bind('click.tabs', function(){return false;});

	},

	destroy: function() {
		var o = this.options;

		this.abort();
		
		this.element.unbind('.tabs')
			.removeClass('ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible')
			.removeData('tabs');

		this.list.removeClass('ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all');

		this.anchors.each(function() {
			var href = $.data(this, 'href.tabs');
			if (href) {
				this.href = href;
			}
			var $this = $(this).unbind('.tabs');
			$.each(['href', 'load', 'cache'], function(i, prefix) {
				$this.removeData(prefix + '.tabs');
			});
		});

		this.lis.unbind('.tabs').add(this.panels).each(function() {
			if ($.data(this, 'destroy.tabs')) {
				$(this).remove();
			}
			else {
				$(this).removeClass([
					'ui-state-default',
					'ui-corner-top',
					'ui-tabs-selected',
					'ui-state-active',
					'ui-state-hover',
					'ui-state-focus',
					'ui-state-disabled',
					'ui-tabs-panel',
					'ui-widget-content',
					'ui-corner-bottom',
					'ui-tabs-hide'
				].join(' '));
			}
		});

		if (o.cookie) {
			this._cookie(null, o.cookie);
		}
	},

	add: function(url, label, index) {
		if (index === undefined) {
			index = this.anchors.length; // append by default
		}

		var self = this, o = this.options,
			$li = $(o.tabTemplate.replace(/#\{href\}/g, url).replace(/#\{label\}/g, label)),
			id = !url.indexOf('#') ? url.replace('#', '') : this._tabId($('a', $li)[0]);

		$li.addClass('ui-state-default ui-corner-top').data('destroy.tabs', true);

		// try to find an existing element before creating a new one
		var $panel = $('#' + id);
		if (!$panel.length) {
			$panel = $(o.panelTemplate).attr('id', id).data('destroy.tabs', true);
		}
		$panel.addClass('ui-tabs-panel ui-widget-content ui-corner-bottom ui-tabs-hide');

		if (index >= this.lis.length) {
			$li.appendTo(this.list);
			$panel.appendTo(this.list[0].parentNode);
		}
		else {
			$li.insertBefore(this.lis[index]);
			$panel.insertBefore(this.panels[index]);
		}

		o.disabled = $.map(o.disabled,
			function(n, i) { return n >= index ? ++n : n; });

		this._tabify();

		if (this.anchors.length == 1) { // after tabify
			$li.addClass('ui-tabs-selected ui-state-active');
			$panel.removeClass('ui-tabs-hide');
			this.element.queue("tabs", function() {
				self._trigger('show', null, self._ui(self.anchors[0], self.panels[0]));
			});
				
			this.load(0);
		}

		// callback
		this._trigger('add', null, this._ui(this.anchors[index], this.panels[index]));
	},

	remove: function(index) {
		var o = this.options, $li = this.lis.eq(index).remove(),
			$panel = this.panels.eq(index).remove();

		// If selected tab was removed focus tab to the right or
		// in case the last tab was removed the tab to the left.
		if ($li.hasClass('ui-tabs-selected') && this.anchors.length > 1) {
			this.select(index + (index + 1 < this.anchors.length ? 1 : -1));
		}

		o.disabled = $.map($.grep(o.disabled, function(n, i) { return n != index; }),
			function(n, i) { return n >= index ? --n : n; });

		this._tabify();

		// callback
		this._trigger('remove', null, this._ui($li.find('a')[0], $panel[0]));
	},

	enable: function(index) {
		var o = this.options;
		if ($.inArray(index, o.disabled) == -1) {
			return;
		}

		this.lis.eq(index).removeClass('ui-state-disabled');
		o.disabled = $.grep(o.disabled, function(n, i) { return n != index; });

		// callback
		this._trigger('enable', null, this._ui(this.anchors[index], this.panels[index]));
	},

	disable: function(index) {
		var self = this, o = this.options;
		if (index != o.selected) { // cannot disable already selected tab
			this.lis.eq(index).addClass('ui-state-disabled');

			o.disabled.push(index);
			o.disabled.sort();

			// callback
			this._trigger('disable', null, this._ui(this.anchors[index], this.panels[index]));
		}
	},

	select: function(index) {
		if (typeof index == 'string') {
			index = this.anchors.index(this.anchors.filter('[href$=' + index + ']'));
		}
		else if (index === null) { // usage of null is deprecated, TODO remove in next release
			index = -1;
		}
		if (index == -1 && this.options.collapsible) {
			index = this.options.selected;
		}

		this.anchors.eq(index).trigger(this.options.event + '.tabs');
	},

	load: function(index) {
		var self = this, o = this.options, a = this.anchors.eq(index)[0], url = $.data(a, 'load.tabs');

		this.abort();

		// not remote or from cache
		if (!url || this.element.queue("tabs").length !== 0 && $.data(a, 'cache.tabs')) {
			this.element.dequeue("tabs");
			return;
		}

		// load remote from here on
		this.lis.eq(index).addClass('ui-state-processing');

		if (o.spinner) {
			var span = $('span', a);
			span.data('label.tabs', span.html()).html(o.spinner);
		}

		this.xhr = $.ajax($.extend({}, o.ajaxOptions, {
			url: url,
			success: function(r, s) {
				$(self._sanitizeSelector(a.hash)).html(r);

				// take care of tab labels
				self._cleanup();

				if (o.cache) {
					$.data(a, 'cache.tabs', true); // if loaded once do not load them again
				}

				// callbacks
				self._trigger('load', null, self._ui(self.anchors[index], self.panels[index]));
				try {
					o.ajaxOptions.success(r, s);
				}
				catch (e) {}

				// last, so that load event is fired before show...
				self.element.dequeue("tabs");
			}
		}));
	},

	abort: function() {
		// stop possibly running animations
		this.element.queue([]);
		this.panels.stop(false, true);

		// terminate pending requests from other tabs
		if (this.xhr) {
			this.xhr.abort();
			delete this.xhr;
		}

		// take care of tab labels
		this._cleanup();

	},

	url: function(index, url) {
		this.anchors.eq(index).removeData('cache.tabs').data('load.tabs', url);
	},

	length: function() {
		return this.anchors.length;
	}

});

$.extend($.ui.tabs, {
	version: '1.7.1',
	getter: 'length',
	defaults: {
		ajaxOptions: null,
		cache: false,
		cookie: null, // e.g. { expires: 7, path: '/', domain: 'jquery.com', secure: true }
		collapsible: false,
		disabled: [],
		event: 'click',
		fx: null, // e.g. { height: 'toggle', opacity: 'toggle', duration: 200 }
		idPrefix: 'ui-tabs-',
		panelTemplate: '<div></div>',
		spinner: '<em>Loading&#8230;</em>',
		tabTemplate: '<li><a href="#{href}"><span>#{label}</span></a></li>'
	}
});

/*
 * Tabs Extensions
 */

/*
 * Rotate
 */
$.extend($.ui.tabs.prototype, {
	rotation: null,
	rotate: function(ms, continuing) {

		var self = this, o = this.options;
		
		var rotate = self._rotate || (self._rotate = function(e) {
			clearTimeout(self.rotation);
			self.rotation = setTimeout(function() {
				var t = o.selected;
				self.select( ++t < self.anchors.length ? t : 0 );
			}, ms);
			
			if (e) {
				e.stopPropagation();
			}
		});
		
		var stop = self._unrotate || (self._unrotate = !continuing ?
			function(e) {
				if (e.clientX) { // in case of a true click
					self.rotate(null);
				}
			} :
			function(e) {
				t = o.selected;
				rotate();
			});

		// start rotation
		if (ms) {
			this.element.bind('tabsshow', rotate);
			this.anchors.bind(o.event + '.tabs', stop);
			rotate();
		}
		// stop rotation
		else {
			clearTimeout(self.rotation);
			this.element.unbind('tabsshow', rotate);
			this.anchors.unbind(o.event + '.tabs', stop);
			delete this._rotate;
			delete this._unrotate;
		}
	}
});

})(jQuery);
/*
 * jQuery UI Datepicker 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Datepicker
 *
 * Depends:
 *	ui.core.js
 */

(function($) { // hide the namespace

$.extend($.ui, { datepicker: { version: "1.7.1" } });

var PROP_NAME = 'datepicker';

/* Date picker manager.
   Use the singleton instance of this class, $.datepicker, to interact with the date picker.
   Settings for (groups of) date pickers are maintained in an instance object,
   allowing multiple different settings on the same page. */

function Datepicker() {
	this.debug = false; // Change this to true to start debugging
	this._curInst = null; // The current instance in use
	this._keyEvent = false; // If the last event was a key event
	this._disabledInputs = []; // List of date picker inputs that have been disabled
	this._datepickerShowing = false; // True if the popup picker is showing , false if not
	this._inDialog = false; // True if showing within a "dialog", false if not
	this._mainDivId = 'ui-datepicker-div'; // The ID of the main datepicker division
	this._inlineClass = 'ui-datepicker-inline'; // The name of the inline marker class
	this._appendClass = 'ui-datepicker-append'; // The name of the append marker class
	this._triggerClass = 'ui-datepicker-trigger'; // The name of the trigger marker class
	this._dialogClass = 'ui-datepicker-dialog'; // The name of the dialog marker class
	this._disableClass = 'ui-datepicker-disabled'; // The name of the disabled covering marker class
	this._unselectableClass = 'ui-datepicker-unselectable'; // The name of the unselectable cell marker class
	this._currentClass = 'ui-datepicker-current-day'; // The name of the current day marker class
	this._dayOverClass = 'ui-datepicker-days-cell-over'; // The name of the day hover marker class
	this.regional = []; // Available regional settings, indexed by language code
	this.regional[''] = { // Default regional settings
		closeText: 'Done', // Display text for close link
		prevText: 'Prev', // Display text for previous month link
		nextText: 'Next', // Display text for next month link
		currentText: 'Today', // Display text for current month link
		monthNames: ['January','February','March','April','May','June',
			'July','August','September','October','November','December'], // Names of months for drop-down and formatting
		monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // For formatting
		dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // For formatting
		dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], // For formatting
		dayNamesMin: ['Su','Mo','Tu','We','Th','Fr','Sa'], // Column headings for days starting at Sunday
		dateFormat: 'mm/dd/yy', // See format options on parseDate
		firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
		isRTL: false // True if right-to-left language, false if left-to-right
	};
	this._defaults = { // Global defaults for all the date picker instances
		showOn: 'focus', // 'focus' for popup on focus,
			// 'button' for trigger button, or 'both' for either
		showAnim: 'show', // Name of jQuery animation for popup
		showOptions: {}, // Options for enhanced animations
		defaultDate: null, // Used when field is blank: actual date,
			// +/-number for offset from today, null for today
		appendText: '', // Display text following the input box, e.g. showing the format
		buttonText: '...', // Text for trigger button
		buttonImage: '', // URL for trigger button image
		buttonImageOnly: false, // True if the image appears alone, false if it appears on a button
		hideIfNoPrevNext: false, // True to hide next/previous month links
			// if not applicable, false to just disable them
		navigationAsDateFormat: false, // True if date formatting applied to prev/today/next links
		gotoCurrent: false, // True if today link goes back to current selection instead
		changeMonth: false, // True if month can be selected directly, false if only prev/next
		changeYear: false, // True if year can be selected directly, false if only prev/next
		showMonthAfterYear: false, // True if the year select precedes month, false for month then year
		yearRange: '-10:+10', // Range of years to display in drop-down,
			// either relative to current year (-nn:+nn) or absolute (nnnn:nnnn)
		showOtherMonths: false, // True to show dates in other months, false to leave blank
		calculateWeek: this.iso8601Week, // How to calculate the week of the year,
			// takes a Date and returns the number of the week for it
		shortYearCutoff: '+10', // Short year values < this are in the current century,
			// > this are in the previous century,
			// string value starting with '+' for current year + value
		minDate: null, // The earliest selectable date, or null for no limit
		maxDate: null, // The latest selectable date, or null for no limit
		duration: 'normal', // Duration of display/closure
		beforeShowDay: null, // Function that takes a date and returns an array with
			// [0] = true if selectable, false if not, [1] = custom CSS class name(s) or '',
			// [2] = cell title (optional), e.g. $.datepicker.noWeekends
		beforeShow: null, // Function that takes an input field and
			// returns a set of custom settings for the date picker
		onSelect: null, // Define a callback function when a date is selected
		onChangeMonthYear: null, // Define a callback function when the month or year is changed
		onClose: null, // Define a callback function when the datepicker is closed
		numberOfMonths: 1, // Number of months to show at a time
		showCurrentAtPos: 0, // The position in multipe months at which to show the current month (starting at 0)
		stepMonths: 1, // Number of months to step back/forward
		stepBigMonths: 12, // Number of months to step back/forward for the big links
		altField: '', // Selector for an alternate field to store selected dates into
		altFormat: '', // The date format to use for the alternate field
		constrainInput: true, // The input is constrained by the current date format
		showButtonPanel: false // True to show button panel, false to not show it
	};
	$.extend(this._defaults, this.regional['']);
	this.dpDiv = $('<div id="' + this._mainDivId + '" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all ui-helper-hidden-accessible"></div>');
}

$.extend(Datepicker.prototype, {
	/* Class name added to elements to indicate already configured with a date picker. */
	markerClassName: 'hasDatepicker',

	/* Debug logging (if enabled). */
	log: function () {
		if (this.debug)
			console.log.apply('', arguments);
	},

	/* Override the default settings for all instances of the date picker.
	   @param  settings  object - the new settings to use as defaults (anonymous object)
	   @return the manager object */
	setDefaults: function(settings) {
		extendRemove(this._defaults, settings || {});
		return this;
	},

	/* Attach the date picker to a jQuery selection.
	   @param  target    element - the target input field or division or span
	   @param  settings  object - the new settings to use for this date picker instance (anonymous) */
	_attachDatepicker: function(target, settings) {
		// check for settings on the control itself - in namespace 'date:'
		var inlineSettings = null;
		for (var attrName in this._defaults) {
			var attrValue = target.getAttribute('date:' + attrName);
			if (attrValue) {
				inlineSettings = inlineSettings || {};
				try {
					inlineSettings[attrName] = eval(attrValue);
				} catch (err) {
					inlineSettings[attrName] = attrValue;
				}
			}
		}
		var nodeName = target.nodeName.toLowerCase();
		var inline = (nodeName == 'div' || nodeName == 'span');
		if (!target.id)
			target.id = 'dp' + (++this.uuid);
		var inst = this._newInst($(target), inline);
		inst.settings = $.extend({}, settings || {}, inlineSettings || {});
		if (nodeName == 'input') {
			this._connectDatepicker(target, inst);
		} else if (inline) {
			this._inlineDatepicker(target, inst);
		}
	},

	/* Create a new instance object. */
	_newInst: function(target, inline) {
		var id = target[0].id.replace(/([:\[\]\.])/g, '\\\\$1'); // escape jQuery meta chars
		return {id: id, input: target, // associated target
			selectedDay: 0, selectedMonth: 0, selectedYear: 0, // current selection
			drawMonth: 0, drawYear: 0, // month being drawn
			inline: inline, // is datepicker inline or not
			dpDiv: (!inline ? this.dpDiv : // presentation div
			$('<div class="' + this._inlineClass + ' ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>'))};
	},

	/* Attach the date picker to an input field. */
	_connectDatepicker: function(target, inst) {
		var input = $(target);
		inst.trigger = $([]);
		if (input.hasClass(this.markerClassName))
			return;
		var appendText = this._get(inst, 'appendText');
		var isRTL = this._get(inst, 'isRTL');
		if (appendText)
			input[isRTL ? 'before' : 'after']('<span class="' + this._appendClass + '">' + appendText + '</span>');
		var showOn = this._get(inst, 'showOn');
		if (showOn == 'focus' || showOn == 'both') // pop-up date picker when in the marked field
			input.focus(this._showDatepicker);
		if (showOn == 'button' || showOn == 'both') { // pop-up date picker when button clicked
			var buttonText = this._get(inst, 'buttonText');
			var buttonImage = this._get(inst, 'buttonImage');
			inst.trigger = $(this._get(inst, 'buttonImageOnly') ?
				$('<img/>').addClass(this._triggerClass).
					attr({ src: buttonImage, alt: buttonText, title: buttonText }) :
				$('<button type="button"></button>').addClass(this._triggerClass).
					html(buttonImage == '' ? buttonText : $('<img/>').attr(
					{ src:buttonImage, alt:buttonText, title:buttonText })));
			input[isRTL ? 'before' : 'after'](inst.trigger);
			inst.trigger.click(function() {
				if ($.datepicker._datepickerShowing && $.datepicker._lastInput == target)
					$.datepicker._hideDatepicker();
				else
					$.datepicker._showDatepicker(target);
				return false;
			});
		}
		input.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).
			bind("setData.datepicker", function(event, key, value) {
				inst.settings[key] = value;
			}).bind("getData.datepicker", function(event, key) {
				return this._get(inst, key);
			});
		$.data(target, PROP_NAME, inst);
	},

	/* Attach an inline date picker to a div. */
	_inlineDatepicker: function(target, inst) {
		var divSpan = $(target);
		if (divSpan.hasClass(this.markerClassName))
			return;
		divSpan.addClass(this.markerClassName).append(inst.dpDiv).
			bind("setData.datepicker", function(event, key, value){
				inst.settings[key] = value;
			}).bind("getData.datepicker", function(event, key){
				return this._get(inst, key);
			});
		$.data(target, PROP_NAME, inst);
		this._setDate(inst, this._getDefaultDate(inst));
		this._updateDatepicker(inst);
		this._updateAlternate(inst);
	},

	/* Pop-up the date picker in a "dialog" box.
	   @param  input     element - ignored
	   @param  dateText  string - the initial date to display (in the current format)
	   @param  onSelect  function - the function(dateText) to call when a date is selected
	   @param  settings  object - update the dialog date picker instance's settings (anonymous object)
	   @param  pos       int[2] - coordinates for the dialog's position within the screen or
	                     event - with x/y coordinates or
	                     leave empty for default (screen centre)
	   @return the manager object */
	_dialogDatepicker: function(input, dateText, onSelect, settings, pos) {
		var inst = this._dialogInst; // internal instance
		if (!inst) {
			var id = 'dp' + (++this.uuid);
			this._dialogInput = $('<input type="text" id="' + id +
				'" size="1" style="position: absolute; top: -100px;"/>');
			this._dialogInput.keydown(this._doKeyDown);
			$('body').append(this._dialogInput);
			inst = this._dialogInst = this._newInst(this._dialogInput, false);
			inst.settings = {};
			$.data(this._dialogInput[0], PROP_NAME, inst);
		}
		extendRemove(inst.settings, settings || {});
		this._dialogInput.val(dateText);

		this._pos = (pos ? (pos.length ? pos : [pos.pageX, pos.pageY]) : null);
		if (!this._pos) {
			var browserWidth = window.innerWidth || document.documentElement.clientWidth ||	document.body.clientWidth;
			var browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
			var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
			var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
			this._pos = // should use actual width/height below
				[(browserWidth / 2) - 100 + scrollX, (browserHeight / 2) - 150 + scrollY];
		}

		// move input on screen for focus, but hidden behind dialog
		this._dialogInput.css('left', this._pos[0] + 'px').css('top', this._pos[1] + 'px');
		inst.settings.onSelect = onSelect;
		this._inDialog = true;
		this.dpDiv.addClass(this._dialogClass);
		this._showDatepicker(this._dialogInput[0]);
		if ($.blockUI)
			$.blockUI(this.dpDiv);
		$.data(this._dialogInput[0], PROP_NAME, inst);
		return this;
	},

	/* Detach a datepicker from its control.
	   @param  target    element - the target input field or division or span */
	_destroyDatepicker: function(target) {
		var $target = $(target);
		var inst = $.data(target, PROP_NAME);
		if (!$target.hasClass(this.markerClassName)) {
			return;
		}
		var nodeName = target.nodeName.toLowerCase();
		$.removeData(target, PROP_NAME);
		if (nodeName == 'input') {
			inst.trigger.remove();
			$target.siblings('.' + this._appendClass).remove().end().
				removeClass(this.markerClassName).
				unbind('focus', this._showDatepicker).
				unbind('keydown', this._doKeyDown).
				unbind('keypress', this._doKeyPress);
		} else if (nodeName == 'div' || nodeName == 'span')
			$target.removeClass(this.markerClassName).empty();
	},

	/* Enable the date picker to a jQuery selection.
	   @param  target    element - the target input field or division or span */
	_enableDatepicker: function(target) {
		var $target = $(target);
		var inst = $.data(target, PROP_NAME);
		if (!$target.hasClass(this.markerClassName)) {
			return;
		}
		var nodeName = target.nodeName.toLowerCase();
		if (nodeName == 'input') {
		target.disabled = false;
			inst.trigger.filter("button").
			each(function() { this.disabled = false; }).end().
				filter("img").
				css({opacity: '1.0', cursor: ''});
		}
		else if (nodeName == 'div' || nodeName == 'span') {
			var inline = $target.children('.' + this._inlineClass);
			inline.children().removeClass('ui-state-disabled');
		}
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value == target ? null : value); }); // delete entry
	},

	/* Disable the date picker to a jQuery selection.
	   @param  target    element - the target input field or division or span */
	_disableDatepicker: function(target) {
		var $target = $(target);
		var inst = $.data(target, PROP_NAME);
		if (!$target.hasClass(this.markerClassName)) {
			return;
		}
		var nodeName = target.nodeName.toLowerCase();
		if (nodeName == 'input') {
		target.disabled = true;
			inst.trigger.filter("button").
			each(function() { this.disabled = true; }).end().
				filter("img").
				css({opacity: '0.5', cursor: 'default'});
		}
		else if (nodeName == 'div' || nodeName == 'span') {
			var inline = $target.children('.' + this._inlineClass);
			inline.children().addClass('ui-state-disabled');
		}
		this._disabledInputs = $.map(this._disabledInputs,
			function(value) { return (value == target ? null : value); }); // delete entry
		this._disabledInputs[this._disabledInputs.length] = target;
	},

	/* Is the first field in a jQuery collection disabled as a datepicker?
	   @param  target    element - the target input field or division or span
	   @return boolean - true if disabled, false if enabled */
	_isDisabledDatepicker: function(target) {
		if (!target) {
			return false;
		}
		for (var i = 0; i < this._disabledInputs.length; i++) {
			if (this._disabledInputs[i] == target)
				return true;
		}
		return false;
	},

	/* Retrieve the instance data for the target control.
	   @param  target  element - the target input field or division or span
	   @return  object - the associated instance data
	   @throws  error if a jQuery problem getting data */
	_getInst: function(target) {
		try {
			return $.data(target, PROP_NAME);
		}
		catch (err) {
			throw 'Missing instance data for this datepicker';
		}
	},

	/* Update the settings for a date picker attached to an input field or division.
	   @param  target  element - the target input field or division or span
	   @param  name    object - the new settings to update or
	                   string - the name of the setting to change or
	   @param  value   any - the new value for the setting (omit if above is an object) */
	_optionDatepicker: function(target, name, value) {
		var settings = name || {};
		if (typeof name == 'string') {
			settings = {};
			settings[name] = value;
		}
		var inst = this._getInst(target);
		if (inst) {
			if (this._curInst == inst) {
				this._hideDatepicker(null);
			}
			extendRemove(inst.settings, settings);
			var date = new Date();
			extendRemove(inst, {rangeStart: null, // start of range
				endDay: null, endMonth: null, endYear: null, // end of range
				selectedDay: date.getDate(), selectedMonth: date.getMonth(),
				selectedYear: date.getFullYear(), // starting point
				currentDay: date.getDate(), currentMonth: date.getMonth(),
				currentYear: date.getFullYear(), // current selection
				drawMonth: date.getMonth(), drawYear: date.getFullYear()}); // month being drawn
			this._updateDatepicker(inst);
		}
	},

	// change method deprecated
	_changeDatepicker: function(target, name, value) {
		this._optionDatepicker(target, name, value);
	},

	/* Redraw the date picker attached to an input field or division.
	   @param  target  element - the target input field or division or span */
	_refreshDatepicker: function(target) {
		var inst = this._getInst(target);
		if (inst) {
			this._updateDatepicker(inst);
		}
	},

	/* Set the dates for a jQuery selection.
	   @param  target   element - the target input field or division or span
	   @param  date     Date - the new date
	   @param  endDate  Date - the new end date for a range (optional) */
	_setDateDatepicker: function(target, date, endDate) {
		var inst = this._getInst(target);
		if (inst) {
			this._setDate(inst, date, endDate);
			this._updateDatepicker(inst);
			this._updateAlternate(inst);
		}
	},

	/* Get the date(s) for the first entry in a jQuery selection.
	   @param  target  element - the target input field or division or span
	   @return Date - the current date or
	           Date[2] - the current dates for a range */
	_getDateDatepicker: function(target) {
		var inst = this._getInst(target);
		if (inst && !inst.inline)
			this._setDateFromField(inst);
		return (inst ? this._getDate(inst) : null);
	},

	/* Handle keystrokes. */
	_doKeyDown: function(event) {
		var inst = $.datepicker._getInst(event.target);
		var handled = true;
		var isRTL = inst.dpDiv.is('.ui-datepicker-rtl');
		inst._keyEvent = true;
		if ($.datepicker._datepickerShowing)
			switch (event.keyCode) {
				case 9:  $.datepicker._hideDatepicker(null, '');
						break; // hide on tab out
				case 13: var sel = $('td.' + $.datepicker._dayOverClass +
							', td.' + $.datepicker._currentClass, inst.dpDiv);
						if (sel[0])
							$.datepicker._selectDay(event.target, inst.selectedMonth, inst.selectedYear, sel[0]);
						else
							$.datepicker._hideDatepicker(null, $.datepicker._get(inst, 'duration'));
						return false; // don't submit the form
						break; // select the value on enter
				case 27: $.datepicker._hideDatepicker(null, $.datepicker._get(inst, 'duration'));
						break; // hide on escape
				case 33: $.datepicker._adjustDate(event.target, (event.ctrlKey ?
							-$.datepicker._get(inst, 'stepBigMonths') :
							-$.datepicker._get(inst, 'stepMonths')), 'M');
						break; // previous month/year on page up/+ ctrl
				case 34: $.datepicker._adjustDate(event.target, (event.ctrlKey ?
							+$.datepicker._get(inst, 'stepBigMonths') :
							+$.datepicker._get(inst, 'stepMonths')), 'M');
						break; // next month/year on page down/+ ctrl
				case 35: if (event.ctrlKey || event.metaKey) $.datepicker._clearDate(event.target);
						handled = event.ctrlKey || event.metaKey;
						break; // clear on ctrl or command +end
				case 36: if (event.ctrlKey || event.metaKey) $.datepicker._gotoToday(event.target);
						handled = event.ctrlKey || event.metaKey;
						break; // current on ctrl or command +home
				case 37: if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, (isRTL ? +1 : -1), 'D');
						handled = event.ctrlKey || event.metaKey;
						// -1 day on ctrl or command +left
						if (event.originalEvent.altKey) $.datepicker._adjustDate(event.target, (event.ctrlKey ?
									-$.datepicker._get(inst, 'stepBigMonths') :
									-$.datepicker._get(inst, 'stepMonths')), 'M');
						// next month/year on alt +left on Mac
						break;
				case 38: if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, -7, 'D');
						handled = event.ctrlKey || event.metaKey;
						break; // -1 week on ctrl or command +up
				case 39: if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, (isRTL ? -1 : +1), 'D');
						handled = event.ctrlKey || event.metaKey;
						// +1 day on ctrl or command +right
						if (event.originalEvent.altKey) $.datepicker._adjustDate(event.target, (event.ctrlKey ?
									+$.datepicker._get(inst, 'stepBigMonths') :
									+$.datepicker._get(inst, 'stepMonths')), 'M');
						// next month/year on alt +right
						break;
				case 40: if (event.ctrlKey || event.metaKey) $.datepicker._adjustDate(event.target, +7, 'D');
						handled = event.ctrlKey || event.metaKey;
						break; // +1 week on ctrl or command +down
				default: handled = false;
			}
		else if (event.keyCode == 36 && event.ctrlKey) // display the date picker on ctrl+home
			$.datepicker._showDatepicker(this);
		else {
			handled = false;
		}
		if (handled) {
			event.preventDefault();
			event.stopPropagation();
		}
	},

	/* Filter entered characters - based on date format. */
	_doKeyPress: function(event) {
		var inst = $.datepicker._getInst(event.target);
		if ($.datepicker._get(inst, 'constrainInput')) {
			var chars = $.datepicker._possibleChars($.datepicker._get(inst, 'dateFormat'));
			var chr = String.fromCharCode(event.charCode == undefined ? event.keyCode : event.charCode);
			return event.ctrlKey || (chr < ' ' || !chars || chars.indexOf(chr) > -1);
		}
	},

	/* Pop-up the date picker for a given input field.
	   @param  input  element - the input field attached to the date picker or
	                  event - if triggered by focus */
	_showDatepicker: function(input) {
		input = input.target || input;
		if (input.nodeName.toLowerCase() != 'input') // find from button/image trigger
			input = $('input', input.parentNode)[0];
		if ($.datepicker._isDisabledDatepicker(input) || $.datepicker._lastInput == input) // already here
			return;
		var inst = $.datepicker._getInst(input);
		var beforeShow = $.datepicker._get(inst, 'beforeShow');
		extendRemove(inst.settings, (beforeShow ? beforeShow.apply(input, [input, inst]) : {}));
		$.datepicker._hideDatepicker(null, '');
		$.datepicker._lastInput = input;
		$.datepicker._setDateFromField(inst);
		if ($.datepicker._inDialog) // hide cursor
			input.value = '';
		if (!$.datepicker._pos) { // position below input
			$.datepicker._pos = $.datepicker._findPos(input);
			$.datepicker._pos[1] += input.offsetHeight; // add the height
		}
		var isFixed = false;
		$(input).parents().each(function() {
			isFixed |= $(this).css('position') == 'fixed';
			return !isFixed;
		});
		if (isFixed && $.browser.opera) { // correction for Opera when fixed and scrolled
			$.datepicker._pos[0] -= document.documentElement.scrollLeft;
			$.datepicker._pos[1] -= document.documentElement.scrollTop;
		}
		var offset = {left: $.datepicker._pos[0], top: $.datepicker._pos[1]};
		$.datepicker._pos = null;
		inst.rangeStart = null;
		// determine sizing offscreen
		inst.dpDiv.css({position: 'absolute', display: 'block', top: '-1000px'});
		$.datepicker._updateDatepicker(inst);
		// fix width for dynamic number of date pickers
		// and adjust position before showing
		offset = $.datepicker._checkOffset(inst, offset, isFixed);
		inst.dpDiv.css({position: ($.datepicker._inDialog && $.blockUI ?
			'static' : (isFixed ? 'fixed' : 'absolute')), display: 'none',
			left: offset.left + 'px', top: offset.top + 'px'});
		if (!inst.inline) {
			var showAnim = $.datepicker._get(inst, 'showAnim') || 'show';
			var duration = $.datepicker._get(inst, 'duration');
			var postProcess = function() {
				$.datepicker._datepickerShowing = true;
				if ($.browser.msie && parseInt($.browser.version,10) < 7) // fix IE < 7 select problems
					$('iframe.ui-datepicker-cover').css({width: inst.dpDiv.width() + 4,
						height: inst.dpDiv.height() + 4});
			};
			if ($.effects && $.effects[showAnim])
				inst.dpDiv.show(showAnim, $.datepicker._get(inst, 'showOptions'), duration, postProcess);
			else
				inst.dpDiv[showAnim](duration, postProcess);
			if (duration == '')
				postProcess();
			if (inst.input[0].type != 'hidden')
				inst.input[0].focus();
			$.datepicker._curInst = inst;
		}
	},

	/* Generate the date picker content. */
	_updateDatepicker: function(inst) {
		var dims = {width: inst.dpDiv.width() + 4,
			height: inst.dpDiv.height() + 4};
		var self = this;
		inst.dpDiv.empty().append(this._generateHTML(inst))
			.find('iframe.ui-datepicker-cover').
				css({width: dims.width, height: dims.height})
			.end()
			.find('button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a')
				.bind('mouseout', function(){
					$(this).removeClass('ui-state-hover');
					if(this.className.indexOf('ui-datepicker-prev') != -1) $(this).removeClass('ui-datepicker-prev-hover');
					if(this.className.indexOf('ui-datepicker-next') != -1) $(this).removeClass('ui-datepicker-next-hover');
				})
				.bind('mouseover', function(){
					if (!self._isDisabledDatepicker( inst.inline ? inst.dpDiv.parent()[0] : inst.input[0])) {
						$(this).parents('.ui-datepicker-calendar').find('a').removeClass('ui-state-hover');
						$(this).addClass('ui-state-hover');
						if(this.className.indexOf('ui-datepicker-prev') != -1) $(this).addClass('ui-datepicker-prev-hover');
						if(this.className.indexOf('ui-datepicker-next') != -1) $(this).addClass('ui-datepicker-next-hover');
					}
				})
			.end()
			.find('.' + this._dayOverClass + ' a')
				.trigger('mouseover')
			.end();
		var numMonths = this._getNumberOfMonths(inst);
		var cols = numMonths[1];
		var width = 17;
		if (cols > 1) {
			inst.dpDiv.addClass('ui-datepicker-multi-' + cols).css('width', (width * cols) + 'em');
		} else {
			inst.dpDiv.removeClass('ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4').width('');
		}
		inst.dpDiv[(numMonths[0] != 1 || numMonths[1] != 1 ? 'add' : 'remove') +
			'Class']('ui-datepicker-multi');
		inst.dpDiv[(this._get(inst, 'isRTL') ? 'add' : 'remove') +
			'Class']('ui-datepicker-rtl');
		if (inst.input && inst.input[0].type != 'hidden' && inst == $.datepicker._curInst)
			$(inst.input[0]).focus();
	},

	/* Check positioning to remain on screen. */
	_checkOffset: function(inst, offset, isFixed) {
		var dpWidth = inst.dpDiv.outerWidth();
		var dpHeight = inst.dpDiv.outerHeight();
		var inputWidth = inst.input ? inst.input.outerWidth() : 0;
		var inputHeight = inst.input ? inst.input.outerHeight() : 0;
		var viewWidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) + $(document).scrollLeft();
		var viewHeight = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) + $(document).scrollTop();

		offset.left -= (this._get(inst, 'isRTL') ? (dpWidth - inputWidth) : 0);
		offset.left -= (isFixed && offset.left == inst.input.offset().left) ? $(document).scrollLeft() : 0;
		offset.top -= (isFixed && offset.top == (inst.input.offset().top + inputHeight)) ? $(document).scrollTop() : 0;

		// now check if datepicker is showing outside window viewport - move to a better place if so.
		offset.left -= (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ? Math.abs(offset.left + dpWidth - viewWidth) : 0;
		offset.top -= (offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ? Math.abs(offset.top + dpHeight + inputHeight*2 - viewHeight) : 0;

		return offset;
	},

	/* Find an object's position on the screen. */
	_findPos: function(obj) {
        while (obj && (obj.type == 'hidden' || obj.nodeType != 1)) {
            obj = obj.nextSibling;
        }
        var position = $(obj).offset();
	    return [position.left, position.top];
	},

	/* Hide the date picker from view.
	   @param  input  element - the input field attached to the date picker
	   @param  duration  string - the duration over which to close the date picker */
	_hideDatepicker: function(input, duration) {
		var inst = this._curInst;
		if (!inst || (input && inst != $.data(input, PROP_NAME)))
			return;
		if (inst.stayOpen)
			this._selectDate('#' + inst.id, this._formatDate(inst,
				inst.currentDay, inst.currentMonth, inst.currentYear));
		inst.stayOpen = false;
		if (this._datepickerShowing) {
			duration = (duration != null ? duration : this._get(inst, 'duration'));
			var showAnim = this._get(inst, 'showAnim');
			var postProcess = function() {
				$.datepicker._tidyDialog(inst);
			};
			if (duration != '' && $.effects && $.effects[showAnim])
				inst.dpDiv.hide(showAnim, $.datepicker._get(inst, 'showOptions'),
					duration, postProcess);
			else
				inst.dpDiv[(duration == '' ? 'hide' : (showAnim == 'slideDown' ? 'slideUp' :
					(showAnim == 'fadeIn' ? 'fadeOut' : 'hide')))](duration, postProcess);
			if (duration == '')
				this._tidyDialog(inst);
			var onClose = this._get(inst, 'onClose');
			if (onClose)
				onClose.apply((inst.input ? inst.input[0] : null),
					[(inst.input ? inst.input.val() : ''), inst]);  // trigger custom callback
			this._datepickerShowing = false;
			this._lastInput = null;
			if (this._inDialog) {
				this._dialogInput.css({ position: 'absolute', left: '0', top: '-100px' });
				if ($.blockUI) {
					$.unblockUI();
					$('body').append(this.dpDiv);
				}
			}
			this._inDialog = false;
		}
		this._curInst = null;
	},

	/* Tidy up after a dialog display. */
	_tidyDialog: function(inst) {
		inst.dpDiv.removeClass(this._dialogClass).unbind('.ui-datepicker-calendar');
	},

	/* Close date picker if clicked elsewhere. */
	_checkExternalClick: function(event) {
		if (!$.datepicker._curInst)
			return;
		var $target = $(event.target);
		if (($target.parents('#' + $.datepicker._mainDivId).length == 0) &&
				!$target.hasClass($.datepicker.markerClassName) &&
				!$target.hasClass($.datepicker._triggerClass) &&
				$.datepicker._datepickerShowing && !($.datepicker._inDialog && $.blockUI))
			$.datepicker._hideDatepicker(null, '');
	},

	/* Adjust one of the date sub-fields. */
	_adjustDate: function(id, offset, period) {
		var target = $(id);
		var inst = this._getInst(target[0]);
		if (this._isDisabledDatepicker(target[0])) {
			return;
		}
		this._adjustInstDate(inst, offset +
			(period == 'M' ? this._get(inst, 'showCurrentAtPos') : 0), // undo positioning
			period);
		this._updateDatepicker(inst);
	},

	/* Action for current link. */
	_gotoToday: function(id) {
		var target = $(id);
		var inst = this._getInst(target[0]);
		if (this._get(inst, 'gotoCurrent') && inst.currentDay) {
			inst.selectedDay = inst.currentDay;
			inst.drawMonth = inst.selectedMonth = inst.currentMonth;
			inst.drawYear = inst.selectedYear = inst.currentYear;
		}
		else {
		var date = new Date();
		inst.selectedDay = date.getDate();
		inst.drawMonth = inst.selectedMonth = date.getMonth();
		inst.drawYear = inst.selectedYear = date.getFullYear();
		}
		this._notifyChange(inst);
		this._adjustDate(target);
	},

	/* Action for selecting a new month/year. */
	_selectMonthYear: function(id, select, period) {
		var target = $(id);
		var inst = this._getInst(target[0]);
		inst._selectingMonthYear = false;
		inst['selected' + (period == 'M' ? 'Month' : 'Year')] =
		inst['draw' + (period == 'M' ? 'Month' : 'Year')] =
			parseInt(select.options[select.selectedIndex].value,10);
		this._notifyChange(inst);
		this._adjustDate(target);
	},

	/* Restore input focus after not changing month/year. */
	_clickMonthYear: function(id) {
		var target = $(id);
		var inst = this._getInst(target[0]);
		if (inst.input && inst._selectingMonthYear && !$.browser.msie)
			inst.input[0].focus();
		inst._selectingMonthYear = !inst._selectingMonthYear;
	},

	/* Action for selecting a day. */
	_selectDay: function(id, month, year, td) {
		var target = $(id);
		if ($(td).hasClass(this._unselectableClass) || this._isDisabledDatepicker(target[0])) {
			return;
		}
		var inst = this._getInst(target[0]);
		inst.selectedDay = inst.currentDay = $('a', td).html();
		inst.selectedMonth = inst.currentMonth = month;
		inst.selectedYear = inst.currentYear = year;
		if (inst.stayOpen) {
			inst.endDay = inst.endMonth = inst.endYear = null;
		}
		this._selectDate(id, this._formatDate(inst,
			inst.currentDay, inst.currentMonth, inst.currentYear));
		if (inst.stayOpen) {
			inst.rangeStart = this._daylightSavingAdjust(
				new Date(inst.currentYear, inst.currentMonth, inst.currentDay));
			this._updateDatepicker(inst);
		}
	},

	/* Erase the input field and hide the date picker. */
	_clearDate: function(id) {
		var target = $(id);
		var inst = this._getInst(target[0]);
		inst.stayOpen = false;
		inst.endDay = inst.endMonth = inst.endYear = inst.rangeStart = null;
		this._selectDate(target, '');
	},

	/* Update the input field with the selected date. */
	_selectDate: function(id, dateStr) {
		var target = $(id);
		var inst = this._getInst(target[0]);
		dateStr = (dateStr != null ? dateStr : this._formatDate(inst));
		if (inst.input)
			inst.input.val(dateStr);
		this._updateAlternate(inst);
		var onSelect = this._get(inst, 'onSelect');
		if (onSelect)
			onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);  // trigger custom callback
		else if (inst.input)
			inst.input.trigger('change'); // fire the change event
		if (inst.inline)
			this._updateDatepicker(inst);
		else if (!inst.stayOpen) {
			this._hideDatepicker(null, this._get(inst, 'duration'));
			this._lastInput = inst.input[0];
			if (typeof(inst.input[0]) != 'object')
				inst.input[0].focus(); // restore focus
			this._lastInput = null;
		}
	},

	/* Update any alternate field to synchronise with the main field. */
	_updateAlternate: function(inst) {
		var altField = this._get(inst, 'altField');
		if (altField) { // update alternate field too
			var altFormat = this._get(inst, 'altFormat') || this._get(inst, 'dateFormat');
			var date = this._getDate(inst);
			dateStr = this.formatDate(altFormat, date, this._getFormatConfig(inst));
			$(altField).each(function() { $(this).val(dateStr); });
		}
	},

	/* Set as beforeShowDay function to prevent selection of weekends.
	   @param  date  Date - the date to customise
	   @return [boolean, string] - is this date selectable?, what is its CSS class? */
	noWeekends: function(date) {
		var day = date.getDay();
		return [(day > 0 && day < 6), ''];
	},

	/* Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
	   @param  date  Date - the date to get the week for
	   @return  number - the number of the week within the year that contains this date */
	iso8601Week: function(date) {
		var checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		var firstMon = new Date(checkDate.getFullYear(), 1 - 1, 4); // First week always contains 4 Jan
		var firstDay = firstMon.getDay() || 7; // Day of week: Mon = 1, ..., Sun = 7
		firstMon.setDate(firstMon.getDate() + 1 - firstDay); // Preceding Monday
		if (firstDay < 4 && checkDate < firstMon) { // Adjust first three days in year if necessary
			checkDate.setDate(checkDate.getDate() - 3); // Generate for previous year
			return $.datepicker.iso8601Week(checkDate);
		} else if (checkDate > new Date(checkDate.getFullYear(), 12 - 1, 28)) { // Check last three days in year
			firstDay = new Date(checkDate.getFullYear() + 1, 1 - 1, 4).getDay() || 7;
			if (firstDay > 4 && (checkDate.getDay() || 7) < firstDay - 3) { // Adjust if necessary
				return 1;
			}
		}
		return Math.floor(((checkDate - firstMon) / 86400000) / 7) + 1; // Weeks to given date
	},

	/* Parse a string value into a date object.
	   See formatDate below for the possible formats.

	   @param  format    string - the expected format of the date
	   @param  value     string - the date in the above format
	   @param  settings  Object - attributes include:
	                     shortYearCutoff  number - the cutoff year for determining the century (optional)
	                     dayNamesShort    string[7] - abbreviated names of the days from Sunday (optional)
	                     dayNames         string[7] - names of the days from Sunday (optional)
	                     monthNamesShort  string[12] - abbreviated names of the months (optional)
	                     monthNames       string[12] - names of the months (optional)
	   @return  Date - the extracted date value or null if value is blank */
	parseDate: function (format, value, settings) {
		if (format == null || value == null)
			throw 'Invalid arguments';
		value = (typeof value == 'object' ? value.toString() : value + '');
		if (value == '')
			return null;
		var shortYearCutoff = (settings ? settings.shortYearCutoff : null) || this._defaults.shortYearCutoff;
		var dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort;
		var dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames;
		var monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort;
		var monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames;
		var year = -1;
		var month = -1;
		var day = -1;
		var doy = -1;
		var literal = false;
		// Check whether a format character is doubled
		var lookAhead = function(match) {
			var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
			if (matches)
				iFormat++;
			return matches;
		};
		// Extract a number from the string value
		var getNumber = function(match) {
			lookAhead(match);
			var origSize = (match == '@' ? 14 : (match == 'y' ? 4 : (match == 'o' ? 3 : 2)));
			var size = origSize;
			var num = 0;
			while (size > 0 && iValue < value.length &&
					value.charAt(iValue) >= '0' && value.charAt(iValue) <= '9') {
				num = num * 10 + parseInt(value.charAt(iValue++),10);
				size--;
			}
			if (size == origSize)
				throw 'Missing number at position ' + iValue;
			return num;
		};
		// Extract a name from the string value and convert to an index
		var getName = function(match, shortNames, longNames) {
			var names = (lookAhead(match) ? longNames : shortNames);
			var size = 0;
			for (var j = 0; j < names.length; j++)
				size = Math.max(size, names[j].length);
			var name = '';
			var iInit = iValue;
			while (size > 0 && iValue < value.length) {
				name += value.charAt(iValue++);
				for (var i = 0; i < names.length; i++)
					if (name == names[i])
						return i + 1;
				size--;
			}
			throw 'Unknown name at position ' + iInit;
		};
		// Confirm that a literal character matches the string value
		var checkLiteral = function() {
			if (value.charAt(iValue) != format.charAt(iFormat))
				throw 'Unexpected literal at position ' + iValue;
			iValue++;
		};
		var iValue = 0;
		for (var iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal)
				if (format.charAt(iFormat) == "'" && !lookAhead("'"))
					literal = false;
				else
					checkLiteral();
			else
				switch (format.charAt(iFormat)) {
					case 'd':
						day = getNumber('d');
						break;
					case 'D':
						getName('D', dayNamesShort, dayNames);
						break;
					case 'o':
						doy = getNumber('o');
						break;
					case 'm':
						month = getNumber('m');
						break;
					case 'M':
						month = getName('M', monthNamesShort, monthNames);
						break;
					case 'y':
						year = getNumber('y');
						break;
					case '@':
						var date = new Date(getNumber('@'));
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
						break;
					case "'":
						if (lookAhead("'"))
							checkLiteral();
						else
							literal = true;
						break;
					default:
						checkLiteral();
				}
		}
		if (year == -1)
			year = new Date().getFullYear();
		else if (year < 100)
			year += new Date().getFullYear() - new Date().getFullYear() % 100 +
				(year <= shortYearCutoff ? 0 : -100);
		if (doy > -1) {
			month = 1;
			day = doy;
			do {
				var dim = this._getDaysInMonth(year, month - 1);
				if (day <= dim)
					break;
				month++;
				day -= dim;
			} while (true);
		}
		var date = this._daylightSavingAdjust(new Date(year, month - 1, day));
		if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day)
			throw 'Invalid date'; // E.g. 31/02/*
		return date;
	},

	/* Standard date formats. */
	ATOM: 'yy-mm-dd', // RFC 3339 (ISO 8601)
	COOKIE: 'D, dd M yy',
	ISO_8601: 'yy-mm-dd',
	RFC_822: 'D, d M y',
	RFC_850: 'DD, dd-M-y',
	RFC_1036: 'D, d M y',
	RFC_1123: 'D, d M yy',
	RFC_2822: 'D, d M yy',
	RSS: 'D, d M y', // RFC 822
	TIMESTAMP: '@',
	W3C: 'yy-mm-dd', // ISO 8601

	/* Format a date object into a string value.
	   The format can be combinations of the following:
	   d  - day of month (no leading zero)
	   dd - day of month (two digit)
	   o  - day of year (no leading zeros)
	   oo - day of year (three digit)
	   D  - day name short
	   DD - day name long
	   m  - month of year (no leading zero)
	   mm - month of year (two digit)
	   M  - month name short
	   MM - month name long
	   y  - year (two digit)
	   yy - year (four digit)
	   @ - Unix timestamp (ms since 01/01/1970)
	   '...' - literal text
	   '' - single quote

	   @param  format    string - the desired format of the date
	   @param  date      Date - the date value to format
	   @param  settings  Object - attributes include:
	                     dayNamesShort    string[7] - abbreviated names of the days from Sunday (optional)
	                     dayNames         string[7] - names of the days from Sunday (optional)
	                     monthNamesShort  string[12] - abbreviated names of the months (optional)
	                     monthNames       string[12] - names of the months (optional)
	   @return  string - the date in the above format */
	formatDate: function (format, date, settings) {
		if (!date)
			return '';
		var dayNamesShort = (settings ? settings.dayNamesShort : null) || this._defaults.dayNamesShort;
		var dayNames = (settings ? settings.dayNames : null) || this._defaults.dayNames;
		var monthNamesShort = (settings ? settings.monthNamesShort : null) || this._defaults.monthNamesShort;
		var monthNames = (settings ? settings.monthNames : null) || this._defaults.monthNames;
		// Check whether a format character is doubled
		var lookAhead = function(match) {
			var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
			if (matches)
				iFormat++;
			return matches;
		};
		// Format a number, with leading zero if necessary
		var formatNumber = function(match, value, len) {
			var num = '' + value;
			if (lookAhead(match))
				while (num.length < len)
					num = '0' + num;
			return num;
		};
		// Format a name, short or long as requested
		var formatName = function(match, value, shortNames, longNames) {
			return (lookAhead(match) ? longNames[value] : shortNames[value]);
		};
		var output = '';
		var literal = false;
		if (date)
			for (var iFormat = 0; iFormat < format.length; iFormat++) {
				if (literal)
					if (format.charAt(iFormat) == "'" && !lookAhead("'"))
						literal = false;
					else
						output += format.charAt(iFormat);
				else
					switch (format.charAt(iFormat)) {
						case 'd':
							output += formatNumber('d', date.getDate(), 2);
							break;
						case 'D':
							output += formatName('D', date.getDay(), dayNamesShort, dayNames);
							break;
						case 'o':
							var doy = date.getDate();
							for (var m = date.getMonth() - 1; m >= 0; m--)
								doy += this._getDaysInMonth(date.getFullYear(), m);
							output += formatNumber('o', doy, 3);
							break;
						case 'm':
							output += formatNumber('m', date.getMonth() + 1, 2);
							break;
						case 'M':
							output += formatName('M', date.getMonth(), monthNamesShort, monthNames);
							break;
						case 'y':
							output += (lookAhead('y') ? date.getFullYear() :
								(date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
							break;
						case '@':
							output += date.getTime();
							break;
						case "'":
							if (lookAhead("'"))
								output += "'";
							else
								literal = true;
							break;
						default:
							output += format.charAt(iFormat);
					}
			}
		return output;
	},

	/* Extract all possible characters from the date format. */
	_possibleChars: function (format) {
		var chars = '';
		var literal = false;
		for (var iFormat = 0; iFormat < format.length; iFormat++)
			if (literal)
				if (format.charAt(iFormat) == "'" && !lookAhead("'"))
					literal = false;
				else
					chars += format.charAt(iFormat);
			else
				switch (format.charAt(iFormat)) {
					case 'd': case 'm': case 'y': case '@':
						chars += '0123456789';
						break;
					case 'D': case 'M':
						return null; // Accept anything
					case "'":
						if (lookAhead("'"))
							chars += "'";
						else
							literal = true;
						break;
					default:
						chars += format.charAt(iFormat);
				}
		return chars;
	},

	/* Get a setting value, defaulting if necessary. */
	_get: function(inst, name) {
		return inst.settings[name] !== undefined ?
			inst.settings[name] : this._defaults[name];
	},

	/* Parse existing date and initialise date picker. */
	_setDateFromField: function(inst) {
		var dateFormat = this._get(inst, 'dateFormat');
		var dates = inst.input ? inst.input.val() : null;
		inst.endDay = inst.endMonth = inst.endYear = null;
		var date = defaultDate = this._getDefaultDate(inst);
		var settings = this._getFormatConfig(inst);
		try {
			date = this.parseDate(dateFormat, dates, settings) || defaultDate;
		} catch (event) {
			this.log(event);
			date = defaultDate;
		}
		inst.selectedDay = date.getDate();
		inst.drawMonth = inst.selectedMonth = date.getMonth();
		inst.drawYear = inst.selectedYear = date.getFullYear();
		inst.currentDay = (dates ? date.getDate() : 0);
		inst.currentMonth = (dates ? date.getMonth() : 0);
		inst.currentYear = (dates ? date.getFullYear() : 0);
		this._adjustInstDate(inst);
	},

	/* Retrieve the default date shown on opening. */
	_getDefaultDate: function(inst) {
		var date = this._determineDate(this._get(inst, 'defaultDate'), new Date());
		var minDate = this._getMinMaxDate(inst, 'min', true);
		var maxDate = this._getMinMaxDate(inst, 'max');
		date = (minDate && date < minDate ? minDate : date);
		date = (maxDate && date > maxDate ? maxDate : date);
		return date;
	},

	/* A date may be specified as an exact value or a relative one. */
	_determineDate: function(date, defaultDate) {
		var offsetNumeric = function(offset) {
			var date = new Date();
			date.setDate(date.getDate() + offset);
			return date;
		};
		var offsetString = function(offset, getDaysInMonth) {
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth();
			var day = date.getDate();
			var pattern = /([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g;
			var matches = pattern.exec(offset);
			while (matches) {
				switch (matches[2] || 'd') {
					case 'd' : case 'D' :
						day += parseInt(matches[1],10); break;
					case 'w' : case 'W' :
						day += parseInt(matches[1],10) * 7; break;
					case 'm' : case 'M' :
						month += parseInt(matches[1],10);
						day = Math.min(day, getDaysInMonth(year, month));
						break;
					case 'y': case 'Y' :
						year += parseInt(matches[1],10);
						day = Math.min(day, getDaysInMonth(year, month));
						break;
				}
				matches = pattern.exec(offset);
			}
			return new Date(year, month, day);
		};
		date = (date == null ? defaultDate :
			(typeof date == 'string' ? offsetString(date, this._getDaysInMonth) :
			(typeof date == 'number' ? (isNaN(date) ? defaultDate : offsetNumeric(date)) : date)));
		date = (date && date.toString() == 'Invalid Date' ? defaultDate : date);
		if (date) {
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
		}
		return this._daylightSavingAdjust(date);
	},

	/* Handle switch to/from daylight saving.
	   Hours may be non-zero on daylight saving cut-over:
	   > 12 when midnight changeover, but then cannot generate
	   midnight datetime, so jump to 1AM, otherwise reset.
	   @param  date  (Date) the date to check
	   @return  (Date) the corrected date */
	_daylightSavingAdjust: function(date) {
		if (!date) return null;
		date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
		return date;
	},

	/* Set the date(s) directly. */
	_setDate: function(inst, date, endDate) {
		var clear = !(date);
		var origMonth = inst.selectedMonth;
		var origYear = inst.selectedYear;
		date = this._determineDate(date, new Date());
		inst.selectedDay = inst.currentDay = date.getDate();
		inst.drawMonth = inst.selectedMonth = inst.currentMonth = date.getMonth();
		inst.drawYear = inst.selectedYear = inst.currentYear = date.getFullYear();
		if (origMonth != inst.selectedMonth || origYear != inst.selectedYear)
			this._notifyChange(inst);
		this._adjustInstDate(inst);
		if (inst.input) {
			inst.input.val(clear ? '' : this._formatDate(inst));
		}
	},

	/* Retrieve the date(s) directly. */
	_getDate: function(inst) {
		var startDate = (!inst.currentYear || (inst.input && inst.input.val() == '') ? null :
			this._daylightSavingAdjust(new Date(
			inst.currentYear, inst.currentMonth, inst.currentDay)));
			return startDate;
	},

	/* Generate the HTML for the current state of the date picker. */
	_generateHTML: function(inst) {
		var today = new Date();
		today = this._daylightSavingAdjust(
			new Date(today.getFullYear(), today.getMonth(), today.getDate())); // clear time
		var isRTL = this._get(inst, 'isRTL');
		var showButtonPanel = this._get(inst, 'showButtonPanel');
		var hideIfNoPrevNext = this._get(inst, 'hideIfNoPrevNext');
		var navigationAsDateFormat = this._get(inst, 'navigationAsDateFormat');
		var numMonths = this._getNumberOfMonths(inst);
		var showCurrentAtPos = this._get(inst, 'showCurrentAtPos');
		var stepMonths = this._get(inst, 'stepMonths');
		var stepBigMonths = this._get(inst, 'stepBigMonths');
		var isMultiMonth = (numMonths[0] != 1 || numMonths[1] != 1);
		var currentDate = this._daylightSavingAdjust((!inst.currentDay ? new Date(9999, 9, 9) :
			new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
		var minDate = this._getMinMaxDate(inst, 'min', true);
		var maxDate = this._getMinMaxDate(inst, 'max');
		var drawMonth = inst.drawMonth - showCurrentAtPos;
		var drawYear = inst.drawYear;
		if (drawMonth < 0) {
			drawMonth += 12;
			drawYear--;
		}
		if (maxDate) {
			var maxDraw = this._daylightSavingAdjust(new Date(maxDate.getFullYear(),
				maxDate.getMonth() - numMonths[1] + 1, maxDate.getDate()));
			maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
			while (this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1)) > maxDraw) {
				drawMonth--;
				if (drawMonth < 0) {
					drawMonth = 11;
					drawYear--;
				}
			}
		}
		inst.drawMonth = drawMonth;
		inst.drawYear = drawYear;
		var prevText = this._get(inst, 'prevText');
		prevText = (!navigationAsDateFormat ? prevText : this.formatDate(prevText,
			this._daylightSavingAdjust(new Date(drawYear, drawMonth - stepMonths, 1)),
			this._getFormatConfig(inst)));
		var prev = (this._canAdjustMonth(inst, -1, drawYear, drawMonth) ?
			'<a class="ui-datepicker-prev ui-corner-all" onclick="DP_jQuery.datepicker._adjustDate(\'#' + inst.id + '\', -' + stepMonths + ', \'M\');"' +
			' title="' + prevText + '"><span class="ui-icon ui-icon-circle-triangle-' + ( isRTL ? 'e' : 'w') + '">' + prevText + '</span></a>' :
			(hideIfNoPrevNext ? '' : '<a class="ui-datepicker-prev ui-corner-all ui-state-disabled" title="'+ prevText +'"><span class="ui-icon ui-icon-circle-triangle-' + ( isRTL ? 'e' : 'w') + '">' + prevText + '</span></a>'));
		var nextText = this._get(inst, 'nextText');
		nextText = (!navigationAsDateFormat ? nextText : this.formatDate(nextText,
			this._daylightSavingAdjust(new Date(drawYear, drawMonth + stepMonths, 1)),
			this._getFormatConfig(inst)));
		var next = (this._canAdjustMonth(inst, +1, drawYear, drawMonth) ?
			'<a class="ui-datepicker-next ui-corner-all" onclick="DP_jQuery.datepicker._adjustDate(\'#' + inst.id + '\', +' + stepMonths + ', \'M\');"' +
			' title="' + nextText + '"><span class="ui-icon ui-icon-circle-triangle-' + ( isRTL ? 'w' : 'e') + '">' + nextText + '</span></a>' :
			(hideIfNoPrevNext ? '' : '<a class="ui-datepicker-next ui-corner-all ui-state-disabled" title="'+ nextText + '"><span class="ui-icon ui-icon-circle-triangle-' + ( isRTL ? 'w' : 'e') + '">' + nextText + '</span></a>'));
		var currentText = this._get(inst, 'currentText');
		var gotoDate = (this._get(inst, 'gotoCurrent') && inst.currentDay ? currentDate : today);
		currentText = (!navigationAsDateFormat ? currentText :
			this.formatDate(currentText, gotoDate, this._getFormatConfig(inst)));
		var controls = (!inst.inline ? '<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" onclick="DP_jQuery.datepicker._hideDatepicker();">' + this._get(inst, 'closeText') + '</button>' : '');
		var buttonPanel = (showButtonPanel) ? '<div class="ui-datepicker-buttonpane ui-widget-content">' + (isRTL ? controls : '') +
			(this._isInRange(inst, gotoDate) ? '<button type="button" class="ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all" onclick="DP_jQuery.datepicker._gotoToday(\'#' + inst.id + '\');"' +
			'>' + currentText + '</button>' : '') + (isRTL ? '' : controls) + '</div>' : '';
		var firstDay = parseInt(this._get(inst, 'firstDay'),10);
		firstDay = (isNaN(firstDay) ? 0 : firstDay);
		var dayNames = this._get(inst, 'dayNames');
		var dayNamesShort = this._get(inst, 'dayNamesShort');
		var dayNamesMin = this._get(inst, 'dayNamesMin');
		var monthNames = this._get(inst, 'monthNames');
		var monthNamesShort = this._get(inst, 'monthNamesShort');
		var beforeShowDay = this._get(inst, 'beforeShowDay');
		var showOtherMonths = this._get(inst, 'showOtherMonths');
		var calculateWeek = this._get(inst, 'calculateWeek') || this.iso8601Week;
		var endDate = inst.endDay ? this._daylightSavingAdjust(
			new Date(inst.endYear, inst.endMonth, inst.endDay)) : currentDate;
		var defaultDate = this._getDefaultDate(inst);
		var html = '';
		for (var row = 0; row < numMonths[0]; row++) {
			var group = '';
			for (var col = 0; col < numMonths[1]; col++) {
				var selectedDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, inst.selectedDay));
				var cornerClass = ' ui-corner-all';
				var calender = '';
				if (isMultiMonth) {
					calender += '<div class="ui-datepicker-group ui-datepicker-group-';
					switch (col) {
						case 0: calender += 'first'; cornerClass = ' ui-corner-' + (isRTL ? 'right' : 'left'); break;
						case numMonths[1]-1: calender += 'last'; cornerClass = ' ui-corner-' + (isRTL ? 'left' : 'right'); break;
						default: calender += 'middle'; cornerClass = ''; break;
					}
					calender += '">';
				}
				calender += '<div class="ui-datepicker-header ui-widget-header ui-helper-clearfix' + cornerClass + '">' +
					(/all|left/.test(cornerClass) && row == 0 ? (isRTL ? next : prev) : '') +
					(/all|right/.test(cornerClass) && row == 0 ? (isRTL ? prev : next) : '') +
					this._generateMonthYearHeader(inst, drawMonth, drawYear, minDate, maxDate,
					selectedDate, row > 0 || col > 0, monthNames, monthNamesShort) + // draw month headers
					'</div><table class="ui-datepicker-calendar"><thead>' +
					'<tr>';
				var thead = '';
				for (var dow = 0; dow < 7; dow++) { // days of the week
					var day = (dow + firstDay) % 7;
					thead += '<th' + ((dow + firstDay + 6) % 7 >= 5 ? ' class="ui-datepicker-week-end"' : '') + '>' +
						'<span title="' + dayNames[day] + '">' + dayNamesMin[day] + '</span></th>';
				}
				calender += thead + '</tr></thead><tbody>';
				var daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
				if (drawYear == inst.selectedYear && drawMonth == inst.selectedMonth)
					inst.selectedDay = Math.min(inst.selectedDay, daysInMonth);
				var leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
				var numRows = (isMultiMonth ? 6 : Math.ceil((leadDays + daysInMonth) / 7)); // calculate the number of rows to generate
				var printDate = this._daylightSavingAdjust(new Date(drawYear, drawMonth, 1 - leadDays));
				for (var dRow = 0; dRow < numRows; dRow++) { // create date picker rows
					calender += '<tr>';
					var tbody = '';
					for (var dow = 0; dow < 7; dow++) { // create date picker days
						var daySettings = (beforeShowDay ?
							beforeShowDay.apply((inst.input ? inst.input[0] : null), [printDate]) : [true, '']);
						var otherMonth = (printDate.getMonth() != drawMonth);
						var unselectable = otherMonth || !daySettings[0] ||
							(minDate && printDate < minDate) || (maxDate && printDate > maxDate);
						tbody += '<td class="' +
							((dow + firstDay + 6) % 7 >= 5 ? ' ui-datepicker-week-end' : '') + // highlight weekends
							(otherMonth ? ' ui-datepicker-other-month' : '') + // highlight days from other months
							((printDate.getTime() == selectedDate.getTime() && drawMonth == inst.selectedMonth && inst._keyEvent) || // user pressed key
							(defaultDate.getTime() == printDate.getTime() && defaultDate.getTime() == selectedDate.getTime()) ?
							// or defaultDate is current printedDate and defaultDate is selectedDate
							' ' + this._dayOverClass : '') + // highlight selected day
							(unselectable ? ' ' + this._unselectableClass + ' ui-state-disabled': '') +  // highlight unselectable days
							(otherMonth && !showOtherMonths ? '' : ' ' + daySettings[1] + // highlight custom dates
							(printDate.getTime() >= currentDate.getTime() && printDate.getTime() <= endDate.getTime() ? // in current range
							' ' + this._currentClass : '') + // highlight selected day
							(printDate.getTime() == today.getTime() ? ' ui-datepicker-today' : '')) + '"' + // highlight today (if different)
							((!otherMonth || showOtherMonths) && daySettings[2] ? ' title="' + daySettings[2] + '"' : '') + // cell title
							(unselectable ? '' : ' onclick="DP_jQuery.datepicker._selectDay(\'#' +
							inst.id + '\',' + drawMonth + ',' + drawYear + ', this);return false;"') + '>' + // actions
							(otherMonth ? (showOtherMonths ? printDate.getDate() : '&#xa0;') : // display for other months
							(unselectable ? '<span class="ui-state-default">' + printDate.getDate() + '</span>' : '<a class="ui-state-default' +
							(printDate.getTime() == today.getTime() ? ' ui-state-highlight' : '') +
							(printDate.getTime() >= currentDate.getTime() && printDate.getTime() <= endDate.getTime() ? // in current range
							' ui-state-active' : '') + // highlight selected day
							'" href="#">' + printDate.getDate() + '</a>')) + '</td>'; // display for this month
						printDate.setDate(printDate.getDate() + 1);
						printDate = this._daylightSavingAdjust(printDate);
					}
					calender += tbody + '</tr>';
				}
				drawMonth++;
				if (drawMonth > 11) {
					drawMonth = 0;
					drawYear++;
				}
				calender += '</tbody></table>' + (isMultiMonth ? '</div>' + 
							((numMonths[0] > 0 && col == numMonths[1]-1) ? '<div class="ui-datepicker-row-break"></div>' : '') : '');
				group += calender;
			}
			html += group;
		}
		html += buttonPanel + ($.browser.msie && parseInt($.browser.version,10) < 7 && !inst.inline ?
			'<iframe src="javascript:false;" class="ui-datepicker-cover" frameborder="0"></iframe>' : '');
		inst._keyEvent = false;
		return html;
	},

	/* Generate the month and year header. */
	_generateMonthYearHeader: function(inst, drawMonth, drawYear, minDate, maxDate,
			selectedDate, secondary, monthNames, monthNamesShort) {
		minDate = (inst.rangeStart && minDate && selectedDate < minDate ? selectedDate : minDate);
		var changeMonth = this._get(inst, 'changeMonth');
		var changeYear = this._get(inst, 'changeYear');
		var showMonthAfterYear = this._get(inst, 'showMonthAfterYear');
		var html = '<div class="ui-datepicker-title">';
		var monthHtml = '';
		// month selection
		if (secondary || !changeMonth)
			monthHtml += '<span class="ui-datepicker-month">' + monthNames[drawMonth] + '</span> ';
		else {
			var inMinYear = (minDate && minDate.getFullYear() == drawYear);
			var inMaxYear = (maxDate && maxDate.getFullYear() == drawYear);
			monthHtml += '<select class="ui-datepicker-month" ' +
				'onchange="DP_jQuery.datepicker._selectMonthYear(\'#' + inst.id + '\', this, \'M\');" ' +
				'onclick="DP_jQuery.datepicker._clickMonthYear(\'#' + inst.id + '\');"' +
			 	'>';
			for (var month = 0; month < 12; month++) {
				if ((!inMinYear || month >= minDate.getMonth()) &&
						(!inMaxYear || month <= maxDate.getMonth()))
					monthHtml += '<option value="' + month + '"' +
						(month == drawMonth ? ' selected="selected"' : '') +
						'>' + monthNamesShort[month] + '</option>';
			}
			monthHtml += '</select>';
		}
		if (!showMonthAfterYear)
			html += monthHtml + ((secondary || changeMonth || changeYear) && (!(changeMonth && changeYear)) ? '&#xa0;' : '');
		// year selection
		if (secondary || !changeYear)
			html += '<span class="ui-datepicker-year">' + drawYear + '</span>';
		else {
			// determine range of years to display
			var years = this._get(inst, 'yearRange').split(':');
			var year = 0;
			var endYear = 0;
			if (years.length != 2) {
				year = drawYear - 10;
				endYear = drawYear + 10;
			} else if (years[0].charAt(0) == '+' || years[0].charAt(0) == '-') {
				year = drawYear + parseInt(years[0], 10);
				endYear = drawYear + parseInt(years[1], 10);
			} else {
				year = parseInt(years[0], 10);
				endYear = parseInt(years[1], 10);
			}
			year = (minDate ? Math.max(year, minDate.getFullYear()) : year);
			endYear = (maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear);
			html += '<select class="ui-datepicker-year" ' +
				'onchange="DP_jQuery.datepicker._selectMonthYear(\'#' + inst.id + '\', this, \'Y\');" ' +
				'onclick="DP_jQuery.datepicker._clickMonthYear(\'#' + inst.id + '\');"' +
				'>';
			for (; year <= endYear; year++) {
				html += '<option value="' + year + '"' +
					(year == drawYear ? ' selected="selected"' : '') +
					'>' + year + '</option>';
			}
			html += '</select>';
		}
		if (showMonthAfterYear)
			html += (secondary || changeMonth || changeYear ? '&#xa0;' : '') + monthHtml;
		html += '</div>'; // Close datepicker_header
		return html;
	},

	/* Adjust one of the date sub-fields. */
	_adjustInstDate: function(inst, offset, period) {
		var year = inst.drawYear + (period == 'Y' ? offset : 0);
		var month = inst.drawMonth + (period == 'M' ? offset : 0);
		var day = Math.min(inst.selectedDay, this._getDaysInMonth(year, month)) +
			(period == 'D' ? offset : 0);
		var date = this._daylightSavingAdjust(new Date(year, month, day));
		// ensure it is within the bounds set
		var minDate = this._getMinMaxDate(inst, 'min', true);
		var maxDate = this._getMinMaxDate(inst, 'max');
		date = (minDate && date < minDate ? minDate : date);
		date = (maxDate && date > maxDate ? maxDate : date);
		inst.selectedDay = date.getDate();
		inst.drawMonth = inst.selectedMonth = date.getMonth();
		inst.drawYear = inst.selectedYear = date.getFullYear();
		if (period == 'M' || period == 'Y')
			this._notifyChange(inst);
	},

	/* Notify change of month/year. */
	_notifyChange: function(inst) {
		var onChange = this._get(inst, 'onChangeMonthYear');
		if (onChange)
			onChange.apply((inst.input ? inst.input[0] : null),
				[inst.selectedYear, inst.selectedMonth + 1, inst]);
	},

	/* Determine the number of months to show. */
	_getNumberOfMonths: function(inst) {
		var numMonths = this._get(inst, 'numberOfMonths');
		return (numMonths == null ? [1, 1] : (typeof numMonths == 'number' ? [1, numMonths] : numMonths));
	},

	/* Determine the current maximum date - ensure no time components are set - may be overridden for a range. */
	_getMinMaxDate: function(inst, minMax, checkRange) {
		var date = this._determineDate(this._get(inst, minMax + 'Date'), null);
		return (!checkRange || !inst.rangeStart ? date :
			(!date || inst.rangeStart > date ? inst.rangeStart : date));
	},

	/* Find the number of days in a given month. */
	_getDaysInMonth: function(year, month) {
		return 32 - new Date(year, month, 32).getDate();
	},

	/* Find the day of the week of the first of a month. */
	_getFirstDayOfMonth: function(year, month) {
		return new Date(year, month, 1).getDay();
	},

	/* Determines if we should allow a "next/prev" month display change. */
	_canAdjustMonth: function(inst, offset, curYear, curMonth) {
		var numMonths = this._getNumberOfMonths(inst);
		var date = this._daylightSavingAdjust(new Date(
			curYear, curMonth + (offset < 0 ? offset : numMonths[1]), 1));
		if (offset < 0)
			date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
		return this._isInRange(inst, date);
	},

	/* Is the given date in the accepted range? */
	_isInRange: function(inst, date) {
		// during range selection, use minimum of selected date and range start
		var newMinDate = (!inst.rangeStart ? null : this._daylightSavingAdjust(
			new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay)));
		newMinDate = (newMinDate && inst.rangeStart < newMinDate ? inst.rangeStart : newMinDate);
		var minDate = newMinDate || this._getMinMaxDate(inst, 'min');
		var maxDate = this._getMinMaxDate(inst, 'max');
		return ((!minDate || date >= minDate) && (!maxDate || date <= maxDate));
	},

	/* Provide the configuration settings for formatting/parsing. */
	_getFormatConfig: function(inst) {
		var shortYearCutoff = this._get(inst, 'shortYearCutoff');
		shortYearCutoff = (typeof shortYearCutoff != 'string' ? shortYearCutoff :
			new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
		return {shortYearCutoff: shortYearCutoff,
			dayNamesShort: this._get(inst, 'dayNamesShort'), dayNames: this._get(inst, 'dayNames'),
			monthNamesShort: this._get(inst, 'monthNamesShort'), monthNames: this._get(inst, 'monthNames')};
	},

	/* Format the given date for display. */
	_formatDate: function(inst, day, month, year) {
		if (!day) {
			inst.currentDay = inst.selectedDay;
			inst.currentMonth = inst.selectedMonth;
			inst.currentYear = inst.selectedYear;
		}
		var date = (day ? (typeof day == 'object' ? day :
			this._daylightSavingAdjust(new Date(year, month, day))) :
			this._daylightSavingAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay)));
		return this.formatDate(this._get(inst, 'dateFormat'), date, this._getFormatConfig(inst));
	}
});

/* jQuery extend now ignores nulls! */
function extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props)
		if (props[name] == null || props[name] == undefined)
			target[name] = props[name];
	return target;
};

/* Determine whether an object is an array. */
function isArray(a) {
	return (a && (($.browser.safari && typeof a == 'object' && a.length) ||
		(a.constructor && a.constructor.toString().match(/\Array\(\)/))));
};

/* Invoke the datepicker functionality.
   @param  options  string - a command, optionally followed by additional parameters or
                    Object - settings for attaching new datepicker functionality
   @return  jQuery object */
$.fn.datepicker = function(options){

	/* Initialise the date picker. */
	if (!$.datepicker.initialized) {
		$(document).mousedown($.datepicker._checkExternalClick).
			find('body').append($.datepicker.dpDiv);
		$.datepicker.initialized = true;
	}

	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (typeof options == 'string' && (options == 'isDisabled' || options == 'getDate'))
		return $.datepicker['_' + options + 'Datepicker'].
			apply($.datepicker, [this[0]].concat(otherArgs));
	return this.each(function() {
		typeof options == 'string' ?
			$.datepicker['_' + options + 'Datepicker'].
				apply($.datepicker, [this].concat(otherArgs)) :
			$.datepicker._attachDatepicker(this, options);
	});
};

$.datepicker = new Datepicker(); // singleton instance
$.datepicker.initialized = false;
$.datepicker.uuid = new Date().getTime();
$.datepicker.version = "1.7.1";

// Workaround for #4055
// Add another global to avoid noConflict issues with inline event handlers
window.DP_jQuery = $;

})(jQuery);
/*
 * jQuery UI Progressbar 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Progressbar
 *
 * Depends:
 *   ui.core.js
 */
(function($) {

$.widget("ui.progressbar", {

	_init: function() {

		this.element
			.addClass("ui-progressbar"
				+ " ui-widget"
				+ " ui-widget-content"
				+ " ui-corner-all")
			.attr({
				role: "progressbar",
				"aria-valuemin": this._valueMin(),
				"aria-valuemax": this._valueMax(),
				"aria-valuenow": this._value()
			});

		this.valueDiv = $('<div class="ui-progressbar-value ui-widget-header ui-corner-left"></div>').appendTo(this.element);

		this._refreshValue();

	},

	destroy: function() {

		this.element
			.removeClass("ui-progressbar"
				+ " ui-widget"
				+ " ui-widget-content"
				+ " ui-corner-all")
			.removeAttr("role")
			.removeAttr("aria-valuemin")
			.removeAttr("aria-valuemax")
			.removeAttr("aria-valuenow")
			.removeData("progressbar")
			.unbind(".progressbar");

		this.valueDiv.remove();

		$.widget.prototype.destroy.apply(this, arguments);

	},

	value: function(newValue) {
		arguments.length && this._setData("value", newValue);
		return this._value();
	},

	_setData: function(key, value) {

		switch (key) {
			case 'value':
				this.options.value = value;
				this._refreshValue();
				this._trigger('change', null, {});
				break;
		}

		$.widget.prototype._setData.apply(this, arguments);

	},

	_value: function() {

		var val = this.options.value;
		if (val < this._valueMin()) val = this._valueMin();
		if (val > this._valueMax()) val = this._valueMax();

		return val;

	},

	_valueMin: function() {
		var valueMin = 0;
		return valueMin;
	},

	_valueMax: function() {
		var valueMax = 100;
		return valueMax;
	},

	_refreshValue: function() {
		var value = this.value();
		this.valueDiv[value == this._valueMax() ? 'addClass' : 'removeClass']("ui-corner-right");
		this.valueDiv.width(value + '%');
		this.element.attr("aria-valuenow", value);
	}

});

$.extend($.ui.progressbar, {
	version: "1.7.1",
	defaults: {
		value: 0
	}
});

})(jQuery);
/*
 * jQuery UI Effects 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/
 */
;jQuery.effects || (function($) {

$.effects = {
	version: "1.7.1",

	// Saves a set of properties in a data storage
	save: function(element, set) {
		for(var i=0; i < set.length; i++) {
			if(set[i] !== null) element.data("ec.storage."+set[i], element[0].style[set[i]]);
		}
	},

	// Restores a set of previously saved properties from a data storage
	restore: function(element, set) {
		for(var i=0; i < set.length; i++) {
			if(set[i] !== null) element.css(set[i], element.data("ec.storage."+set[i]));
		}
	},

	setMode: function(el, mode) {
		if (mode == 'toggle') mode = el.is(':hidden') ? 'show' : 'hide'; // Set for toggle
		return mode;
	},

	getBaseline: function(origin, original) { // Translates a [top,left] array into a baseline value
		// this should be a little more flexible in the future to handle a string & hash
		var y, x;
		switch (origin[0]) {
			case 'top': y = 0; break;
			case 'middle': y = 0.5; break;
			case 'bottom': y = 1; break;
			default: y = origin[0] / original.height;
		};
		switch (origin[1]) {
			case 'left': x = 0; break;
			case 'center': x = 0.5; break;
			case 'right': x = 1; break;
			default: x = origin[1] / original.width;
		};
		return {x: x, y: y};
	},

	// Wraps the element around a wrapper that copies position properties
	createWrapper: function(element) {

		//if the element is already wrapped, return it
		if (element.parent().is('.ui-effects-wrapper'))
			return element.parent();

		//Cache width,height and float properties of the element, and create a wrapper around it
		var props = { width: element.outerWidth(true), height: element.outerHeight(true), 'float': element.css('float') };
		element.wrap('<div class="ui-effects-wrapper" style="font-size:100%;background:transparent;border:none;margin:0;padding:0"></div>');
		var wrapper = element.parent();

		//Transfer the positioning of the element to the wrapper
		if (element.css('position') == 'static') {
			wrapper.css({ position: 'relative' });
			element.css({ position: 'relative'} );
		} else {
			var top = element.css('top'); if(isNaN(parseInt(top,10))) top = 'auto';
			var left = element.css('left'); if(isNaN(parseInt(left,10))) left = 'auto';
			wrapper.css({ position: element.css('position'), top: top, left: left, zIndex: element.css('z-index') }).show();
			element.css({position: 'relative', top: 0, left: 0 });
		}

		wrapper.css(props);
		return wrapper;
	},

	removeWrapper: function(element) {
		if (element.parent().is('.ui-effects-wrapper'))
			return element.parent().replaceWith(element);
		return element;
	},

	setTransition: function(element, list, factor, value) {
		value = value || {};
		$.each(list, function(i, x){
			unit = element.cssUnit(x);
			if (unit[0] > 0) value[x] = unit[0] * factor + unit[1];
		});
		return value;
	},

	//Base function to animate from one class to another in a seamless transition
	animateClass: function(value, duration, easing, callback) {

		var cb = (typeof easing == "function" ? easing : (callback ? callback : null));
		var ea = (typeof easing == "string" ? easing : null);

		return this.each(function() {

			var offset = {}; var that = $(this); var oldStyleAttr = that.attr("style") || '';
			if(typeof oldStyleAttr == 'object') oldStyleAttr = oldStyleAttr["cssText"]; /* Stupidly in IE, style is a object.. */
			if(value.toggle) { that.hasClass(value.toggle) ? value.remove = value.toggle : value.add = value.toggle; }

			//Let's get a style offset
			var oldStyle = $.extend({}, (document.defaultView ? document.defaultView.getComputedStyle(this,null) : this.currentStyle));
			if(value.add) that.addClass(value.add); if(value.remove) that.removeClass(value.remove);
			var newStyle = $.extend({}, (document.defaultView ? document.defaultView.getComputedStyle(this,null) : this.currentStyle));
			if(value.add) that.removeClass(value.add); if(value.remove) that.addClass(value.remove);

			// The main function to form the object for animation
			for(var n in newStyle) {
				if( typeof newStyle[n] != "function" && newStyle[n] /* No functions and null properties */
				&& n.indexOf("Moz") == -1 && n.indexOf("length") == -1 /* No mozilla spezific render properties. */
				&& newStyle[n] != oldStyle[n] /* Only values that have changed are used for the animation */
				&& (n.match(/color/i) || (!n.match(/color/i) && !isNaN(parseInt(newStyle[n],10)))) /* Only things that can be parsed to integers or colors */
				&& (oldStyle.position != "static" || (oldStyle.position == "static" && !n.match(/left|top|bottom|right/))) /* No need for positions when dealing with static positions */
				) offset[n] = newStyle[n];
			}

			that.animate(offset, duration, ea, function() { // Animate the newly constructed offset object
				// Change style attribute back to original. For stupid IE, we need to clear the damn object.
				if(typeof $(this).attr("style") == 'object') { $(this).attr("style")["cssText"] = ""; $(this).attr("style")["cssText"] = oldStyleAttr; } else $(this).attr("style", oldStyleAttr);
				if(value.add) $(this).addClass(value.add); if(value.remove) $(this).removeClass(value.remove);
				if(cb) cb.apply(this, arguments);
			});

		});
	}
};


function _normalizeArguments(a, m) {

	var o = a[1] && a[1].constructor == Object ? a[1] : {}; if(m) o.mode = m;
	var speed = a[1] && a[1].constructor != Object ? a[1] : (o.duration ? o.duration : a[2]); //either comes from options.duration or the secon/third argument
		speed = $.fx.off ? 0 : typeof speed === "number" ? speed : $.fx.speeds[speed] || $.fx.speeds._default;
	var callback = o.callback || ( $.isFunction(a[1]) && a[1] ) || ( $.isFunction(a[2]) && a[2] ) || ( $.isFunction(a[3]) && a[3] );

	return [a[0], o, speed, callback];
	
}

//Extend the methods of jQuery
$.fn.extend({

	//Save old methods
	_show: $.fn.show,
	_hide: $.fn.hide,
	__toggle: $.fn.toggle,
	_addClass: $.fn.addClass,
	_removeClass: $.fn.removeClass,
	_toggleClass: $.fn.toggleClass,

	// New effect methods
	effect: function(fx, options, speed, callback) {
		return $.effects[fx] ? $.effects[fx].call(this, {method: fx, options: options || {}, duration: speed, callback: callback }) : null;
	},

	show: function() {
		if(!arguments[0] || (arguments[0].constructor == Number || (/(slow|normal|fast)/).test(arguments[0])))
			return this._show.apply(this, arguments);
		else {
			return this.effect.apply(this, _normalizeArguments(arguments, 'show'));
		}
	},

	hide: function() {
		if(!arguments[0] || (arguments[0].constructor == Number || (/(slow|normal|fast)/).test(arguments[0])))
			return this._hide.apply(this, arguments);
		else {
			return this.effect.apply(this, _normalizeArguments(arguments, 'hide'));
		}
	},

	toggle: function(){
		if(!arguments[0] || (arguments[0].constructor == Number || (/(slow|normal|fast)/).test(arguments[0])) || (arguments[0].constructor == Function))
			return this.__toggle.apply(this, arguments);
		else {
			return this.effect.apply(this, _normalizeArguments(arguments, 'toggle'));
		}
	},

	addClass: function(classNames, speed, easing, callback) {
		return speed ? $.effects.animateClass.apply(this, [{ add: classNames },speed,easing,callback]) : this._addClass(classNames);
	},
	removeClass: function(classNames,speed,easing,callback) {
		return speed ? $.effects.animateClass.apply(this, [{ remove: classNames },speed,easing,callback]) : this._removeClass(classNames);
	},
	toggleClass: function(classNames,speed,easing,callback) {
		return ( (typeof speed !== "boolean") && speed ) ? $.effects.animateClass.apply(this, [{ toggle: classNames },speed,easing,callback]) : this._toggleClass(classNames, speed);
	},
	morph: function(remove,add,speed,easing,callback) {
		return $.effects.animateClass.apply(this, [{ add: add, remove: remove },speed,easing,callback]);
	},
	switchClass: function() {
		return this.morph.apply(this, arguments);
	},

	// helper functions
	cssUnit: function(key) {
		var style = this.css(key), val = [];
		$.each( ['em','px','%','pt'], function(i, unit){
			if(style.indexOf(unit) > 0)
				val = [parseFloat(style), unit];
		});
		return val;
	}
});

/*
 * jQuery Color Animations
 * Copyright 2007 John Resig
 * Released under the MIT and GPL licenses.
 */

// We override the animation for all of these color styles
$.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'], function(i,attr){
		$.fx.step[attr] = function(fx) {
				if ( fx.state == 0 ) {
						fx.start = getColor( fx.elem, attr );
						fx.end = getRGB( fx.end );
				}

				fx.elem.style[attr] = "rgb(" + [
						Math.max(Math.min( parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0],10), 255), 0),
						Math.max(Math.min( parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1],10), 255), 0),
						Math.max(Math.min( parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2],10), 255), 0)
				].join(",") + ")";
			};
});

// Color Conversion functions from highlightFade
// By Blair Mitchelmore
// http://jquery.offput.ca/highlightFade/

// Parse strings looking for color tuples [255,255,255]
function getRGB(color) {
		var result;

		// Check if we're already dealing with an array of colors
		if ( color && color.constructor == Array && color.length == 3 )
				return color;

		// Look for rgb(num,num,num)
		if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
				return [parseInt(result[1],10), parseInt(result[2],10), parseInt(result[3],10)];

		// Look for rgb(num%,num%,num%)
		if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
				return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];

		// Look for #a0b1c2
		if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
				return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];

		// Look for #fff
		if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
				return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];

		// Look for rgba(0, 0, 0, 0) == transparent in Safari 3
		if (result = /rgba\(0, 0, 0, 0\)/.exec(color))
				return colors['transparent'];

		// Otherwise, we're most likely dealing with a named color
		return colors[$.trim(color).toLowerCase()];
}

function getColor(elem, attr) {
		var color;

		do {
				color = $.curCSS(elem, attr);

				// Keep going until we find an element that has color, or we hit the body
				if ( color != '' && color != 'transparent' || $.nodeName(elem, "body") )
						break;

				attr = "backgroundColor";
		} while ( elem = elem.parentNode );

		return getRGB(color);
};

// Some named colors to work with
// From Interface by Stefan Petre
// http://interface.eyecon.ro/

var colors = {
	aqua:[0,255,255],
	azure:[240,255,255],
	beige:[245,245,220],
	black:[0,0,0],
	blue:[0,0,255],
	brown:[165,42,42],
	cyan:[0,255,255],
	darkblue:[0,0,139],
	darkcyan:[0,139,139],
	darkgrey:[169,169,169],
	darkgreen:[0,100,0],
	darkkhaki:[189,183,107],
	darkmagenta:[139,0,139],
	darkolivegreen:[85,107,47],
	darkorange:[255,140,0],
	darkorchid:[153,50,204],
	darkred:[139,0,0],
	darksalmon:[233,150,122],
	darkviolet:[148,0,211],
	fuchsia:[255,0,255],
	gold:[255,215,0],
	green:[0,128,0],
	indigo:[75,0,130],
	khaki:[240,230,140],
	lightblue:[173,216,230],
	lightcyan:[224,255,255],
	lightgreen:[144,238,144],
	lightgrey:[211,211,211],
	lightpink:[255,182,193],
	lightyellow:[255,255,224],
	lime:[0,255,0],
	magenta:[255,0,255],
	maroon:[128,0,0],
	navy:[0,0,128],
	olive:[128,128,0],
	orange:[255,165,0],
	pink:[255,192,203],
	purple:[128,0,128],
	violet:[128,0,128],
	red:[255,0,0],
	silver:[192,192,192],
	white:[255,255,255],
	yellow:[255,255,0],
	transparent: [255,255,255]
};

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
$.easing.jswing = $.easing.swing;

$.extend($.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert($.easing.default);
		return $.easing[$.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - $.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return $.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return $.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

})(jQuery);
/*
 * jQuery UI Effects Blind 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Blind
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.blind = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this), props = ['position','top','left'];

		// Set options
		var mode = $.effects.setMode(el, o.options.mode || 'hide'); // Set Mode
		var direction = o.options.direction || 'vertical'; // Default direction

		// Adjust
		$.effects.save(el, props); el.show(); // Save & Show
		var wrapper = $.effects.createWrapper(el).css({overflow:'hidden'}); // Create Wrapper
		var ref = (direction == 'vertical') ? 'height' : 'width';
		var distance = (direction == 'vertical') ? wrapper.height() : wrapper.width();
		if(mode == 'show') wrapper.css(ref, 0); // Shift

		// Animation
		var animation = {};
		animation[ref] = mode == 'show' ? distance : 0;

		// Animate
		wrapper.animate(animation, o.duration, o.options.easing, function() {
			if(mode == 'hide') el.hide(); // Hide
			$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore
			if(o.callback) o.callback.apply(el[0], arguments); // Callback
			el.dequeue();
		});

	});

};

})(jQuery);
/*
 * jQuery UI Effects Bounce 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Bounce
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.bounce = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this), props = ['position','top','left'];

		// Set options
		var mode = $.effects.setMode(el, o.options.mode || 'effect'); // Set Mode
		var direction = o.options.direction || 'up'; // Default direction
		var distance = o.options.distance || 20; // Default distance
		var times = o.options.times || 5; // Default # of times
		var speed = o.duration || 250; // Default speed per bounce
		if (/show|hide/.test(mode)) props.push('opacity'); // Avoid touching opacity to prevent clearType and PNG issues in IE

		// Adjust
		$.effects.save(el, props); el.show(); // Save & Show
		$.effects.createWrapper(el); // Create Wrapper
		var ref = (direction == 'up' || direction == 'down') ? 'top' : 'left';
		var motion = (direction == 'up' || direction == 'left') ? 'pos' : 'neg';
		var distance = o.options.distance || (ref == 'top' ? el.outerHeight({margin:true}) / 3 : el.outerWidth({margin:true}) / 3);
		if (mode == 'show') el.css('opacity', 0).css(ref, motion == 'pos' ? -distance : distance); // Shift
		if (mode == 'hide') distance = distance / (times * 2);
		if (mode != 'hide') times--;

		// Animate
		if (mode == 'show') { // Show Bounce
			var animation = {opacity: 1};
			animation[ref] = (motion == 'pos' ? '+=' : '-=') + distance;
			el.animate(animation, speed / 2, o.options.easing);
			distance = distance / 2;
			times--;
		};
		for (var i = 0; i < times; i++) { // Bounces
			var animation1 = {}, animation2 = {};
			animation1[ref] = (motion == 'pos' ? '-=' : '+=') + distance;
			animation2[ref] = (motion == 'pos' ? '+=' : '-=') + distance;
			el.animate(animation1, speed / 2, o.options.easing).animate(animation2, speed / 2, o.options.easing);
			distance = (mode == 'hide') ? distance * 2 : distance / 2;
		};
		if (mode == 'hide') { // Last Bounce
			var animation = {opacity: 0};
			animation[ref] = (motion == 'pos' ? '-=' : '+=')  + distance;
			el.animate(animation, speed / 2, o.options.easing, function(){
				el.hide(); // Hide
				$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore
				if(o.callback) o.callback.apply(this, arguments); // Callback
			});
		} else {
			var animation1 = {}, animation2 = {};
			animation1[ref] = (motion == 'pos' ? '-=' : '+=') + distance;
			animation2[ref] = (motion == 'pos' ? '+=' : '-=') + distance;
			el.animate(animation1, speed / 2, o.options.easing).animate(animation2, speed / 2, o.options.easing, function(){
				$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore
				if(o.callback) o.callback.apply(this, arguments); // Callback
			});
		};
		el.queue('fx', function() { el.dequeue(); });
		el.dequeue();
	});

};

})(jQuery);
/*
 * jQuery UI Effects Clip 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Clip
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.clip = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this), props = ['position','top','left','height','width'];

		// Set options
		var mode = $.effects.setMode(el, o.options.mode || 'hide'); // Set Mode
		var direction = o.options.direction || 'vertical'; // Default direction

		// Adjust
		$.effects.save(el, props); el.show(); // Save & Show
		var wrapper = $.effects.createWrapper(el).css({overflow:'hidden'}); // Create Wrapper
		var animate = el[0].tagName == 'IMG' ? wrapper : el;
		var ref = {
			size: (direction == 'vertical') ? 'height' : 'width',
			position: (direction == 'vertical') ? 'top' : 'left'
		};
		var distance = (direction == 'vertical') ? animate.height() : animate.width();
		if(mode == 'show') { animate.css(ref.size, 0); animate.css(ref.position, distance / 2); } // Shift

		// Animation
		var animation = {};
		animation[ref.size] = mode == 'show' ? distance : 0;
		animation[ref.position] = mode == 'show' ? 0 : distance / 2;

		// Animate
		animate.animate(animation, { queue: false, duration: o.duration, easing: o.options.easing, complete: function() {
			if(mode == 'hide') el.hide(); // Hide
			$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore
			if(o.callback) o.callback.apply(el[0], arguments); // Callback
			el.dequeue();
		}});

	});

};

})(jQuery);
/*
 * jQuery UI Effects Drop 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Drop
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.drop = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this), props = ['position','top','left','opacity'];

		// Set options
		var mode = $.effects.setMode(el, o.options.mode || 'hide'); // Set Mode
		var direction = o.options.direction || 'left'; // Default Direction

		// Adjust
		$.effects.save(el, props); el.show(); // Save & Show
		$.effects.createWrapper(el); // Create Wrapper
		var ref = (direction == 'up' || direction == 'down') ? 'top' : 'left';
		var motion = (direction == 'up' || direction == 'left') ? 'pos' : 'neg';
		var distance = o.options.distance || (ref == 'top' ? el.outerHeight({margin:true}) / 2 : el.outerWidth({margin:true}) / 2);
		if (mode == 'show') el.css('opacity', 0).css(ref, motion == 'pos' ? -distance : distance); // Shift

		// Animation
		var animation = {opacity: mode == 'show' ? 1 : 0};
		animation[ref] = (mode == 'show' ? (motion == 'pos' ? '+=' : '-=') : (motion == 'pos' ? '-=' : '+=')) + distance;

		// Animate
		el.animate(animation, { queue: false, duration: o.duration, easing: o.options.easing, complete: function() {
			if(mode == 'hide') el.hide(); // Hide
			$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore
			if(o.callback) o.callback.apply(this, arguments); // Callback
			el.dequeue();
		}});

	});

};

})(jQuery);
/*
 * jQuery UI Effects Explode 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Explode
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.explode = function(o) {

	return this.queue(function() {

	var rows = o.options.pieces ? Math.round(Math.sqrt(o.options.pieces)) : 3;
	var cells = o.options.pieces ? Math.round(Math.sqrt(o.options.pieces)) : 3;

	o.options.mode = o.options.mode == 'toggle' ? ($(this).is(':visible') ? 'hide' : 'show') : o.options.mode;
	var el = $(this).show().css('visibility', 'hidden');
	var offset = el.offset();

	//Substract the margins - not fixing the problem yet.
	offset.top -= parseInt(el.css("marginTop"),10) || 0;
	offset.left -= parseInt(el.css("marginLeft"),10) || 0;

	var width = el.outerWidth(true);
	var height = el.outerHeight(true);

	for(var i=0;i<rows;i++) { // =
		for(var j=0;j<cells;j++) { // ||
			el
				.clone()
				.appendTo('body')
				.wrap('<div></div>')
				.css({
					position: 'absolute',
					visibility: 'visible',
					left: -j*(width/cells),
					top: -i*(height/rows)
				})
				.parent()
				.addClass('ui-effects-explode')
				.css({
					position: 'absolute',
					overflow: 'hidden',
					width: width/cells,
					height: height/rows,
					left: offset.left + j*(width/cells) + (o.options.mode == 'show' ? (j-Math.floor(cells/2))*(width/cells) : 0),
					top: offset.top + i*(height/rows) + (o.options.mode == 'show' ? (i-Math.floor(rows/2))*(height/rows) : 0),
					opacity: o.options.mode == 'show' ? 0 : 1
				}).animate({
					left: offset.left + j*(width/cells) + (o.options.mode == 'show' ? 0 : (j-Math.floor(cells/2))*(width/cells)),
					top: offset.top + i*(height/rows) + (o.options.mode == 'show' ? 0 : (i-Math.floor(rows/2))*(height/rows)),
					opacity: o.options.mode == 'show' ? 1 : 0
				}, o.duration || 500);
		}
	}

	// Set a timeout, to call the callback approx. when the other animations have finished
	setTimeout(function() {

		o.options.mode == 'show' ? el.css({ visibility: 'visible' }) : el.css({ visibility: 'visible' }).hide();
				if(o.callback) o.callback.apply(el[0]); // Callback
				el.dequeue();

				$('div.ui-effects-explode').remove();

	}, o.duration || 500);


	});

};

})(jQuery);
/*
 * jQuery UI Effects Fold 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Fold
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.fold = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this), props = ['position','top','left'];

		// Set options
		var mode = $.effects.setMode(el, o.options.mode || 'hide'); // Set Mode
		var size = o.options.size || 15; // Default fold size
		var horizFirst = !(!o.options.horizFirst); // Ensure a boolean value
		var duration = o.duration ? o.duration / 2 : $.fx.speeds._default / 2;

		// Adjust
		$.effects.save(el, props); el.show(); // Save & Show
		var wrapper = $.effects.createWrapper(el).css({overflow:'hidden'}); // Create Wrapper
		var widthFirst = ((mode == 'show') != horizFirst);
		var ref = widthFirst ? ['width', 'height'] : ['height', 'width'];
		var distance = widthFirst ? [wrapper.width(), wrapper.height()] : [wrapper.height(), wrapper.width()];
		var percent = /([0-9]+)%/.exec(size);
		if(percent) size = parseInt(percent[1],10) / 100 * distance[mode == 'hide' ? 0 : 1];
		if(mode == 'show') wrapper.css(horizFirst ? {height: 0, width: size} : {height: size, width: 0}); // Shift

		// Animation
		var animation1 = {}, animation2 = {};
		animation1[ref[0]] = mode == 'show' ? distance[0] : size;
		animation2[ref[1]] = mode == 'show' ? distance[1] : 0;

		// Animate
		wrapper.animate(animation1, duration, o.options.easing)
		.animate(animation2, duration, o.options.easing, function() {
			if(mode == 'hide') el.hide(); // Hide
			$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore
			if(o.callback) o.callback.apply(el[0], arguments); // Callback
			el.dequeue();
		});

	});

};

})(jQuery);
/*
 * jQuery UI Effects Highlight 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Highlight
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.highlight = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this), props = ['backgroundImage','backgroundColor','opacity'];

		// Set options
		var mode = $.effects.setMode(el, o.options.mode || 'show'); // Set Mode
		var color = o.options.color || "#ffff99"; // Default highlight color
		var oldColor = el.css("backgroundColor");

		// Adjust
		$.effects.save(el, props); el.show(); // Save & Show
		el.css({backgroundImage: 'none', backgroundColor: color}); // Shift

		// Animation
		var animation = {backgroundColor: oldColor };
		if (mode == "hide") animation['opacity'] = 0;

		// Animate
		el.animate(animation, { queue: false, duration: o.duration, easing: o.options.easing, complete: function() {
			if(mode == "hide") el.hide();
			$.effects.restore(el, props);
		if (mode == "show" && $.browser.msie) this.style.removeAttribute('filter');
			if(o.callback) o.callback.apply(this, arguments);
			el.dequeue();
		}});

	});

};

})(jQuery);
/*
 * jQuery UI Effects Pulsate 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Pulsate
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.pulsate = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this);

		// Set options
		var mode = $.effects.setMode(el, o.options.mode || 'show'); // Set Mode
		var times = o.options.times || 5; // Default # of times
		var duration = o.duration ? o.duration / 2 : $.fx.speeds._default / 2;

		// Adjust
		if (mode == 'hide') times--;
		if (el.is(':hidden')) { // Show fadeIn
			el.css('opacity', 0);
			el.show(); // Show
			el.animate({opacity: 1}, duration, o.options.easing);
			times = times-2;
		}

		// Animate
		for (var i = 0; i < times; i++) { // Pulsate
			el.animate({opacity: 0}, duration, o.options.easing).animate({opacity: 1}, duration, o.options.easing);
		};
		if (mode == 'hide') { // Last Pulse
			el.animate({opacity: 0}, duration, o.options.easing, function(){
				el.hide(); // Hide
				if(o.callback) o.callback.apply(this, arguments); // Callback
			});
		} else {
			el.animate({opacity: 0}, duration, o.options.easing).animate({opacity: 1}, duration, o.options.easing, function(){
				if(o.callback) o.callback.apply(this, arguments); // Callback
			});
		};
		el.queue('fx', function() { el.dequeue(); });
		el.dequeue();
	});

};

})(jQuery);
/*
 * jQuery UI Effects Scale 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Scale
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.puff = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this);

		// Set options
		var options = $.extend(true, {}, o.options);
		var mode = $.effects.setMode(el, o.options.mode || 'hide'); // Set Mode
		var percent = parseInt(o.options.percent,10) || 150; // Set default puff percent
		options.fade = true; // It's not a puff if it doesn't fade! :)
		var original = {height: el.height(), width: el.width()}; // Save original

		// Adjust
		var factor = percent / 100;
		el.from = (mode == 'hide') ? original : {height: original.height * factor, width: original.width * factor};

		// Animation
		options.from = el.from;
		options.percent = (mode == 'hide') ? percent : 100;
		options.mode = mode;

		// Animate
		el.effect('scale', options, o.duration, o.callback);
		el.dequeue();
	});

};

$.effects.scale = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this);

		// Set options
		var options = $.extend(true, {}, o.options);
		var mode = $.effects.setMode(el, o.options.mode || 'effect'); // Set Mode
		var percent = parseInt(o.options.percent,10) || (parseInt(o.options.percent,10) == 0 ? 0 : (mode == 'hide' ? 0 : 100)); // Set default scaling percent
		var direction = o.options.direction || 'both'; // Set default axis
		var origin = o.options.origin; // The origin of the scaling
		if (mode != 'effect') { // Set default origin and restore for show/hide
			options.origin = origin || ['middle','center'];
			options.restore = true;
		}
		var original = {height: el.height(), width: el.width()}; // Save original
		el.from = o.options.from || (mode == 'show' ? {height: 0, width: 0} : original); // Default from state

		// Adjust
		var factor = { // Set scaling factor
			y: direction != 'horizontal' ? (percent / 100) : 1,
			x: direction != 'vertical' ? (percent / 100) : 1
		};
		el.to = {height: original.height * factor.y, width: original.width * factor.x}; // Set to state

		if (o.options.fade) { // Fade option to support puff
			if (mode == 'show') {el.from.opacity = 0; el.to.opacity = 1;};
			if (mode == 'hide') {el.from.opacity = 1; el.to.opacity = 0;};
		};

		// Animation
		options.from = el.from; options.to = el.to; options.mode = mode;

		// Animate
		el.effect('size', options, o.duration, o.callback);
		el.dequeue();
	});

};

$.effects.size = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this), props = ['position','top','left','width','height','overflow','opacity'];
		var props1 = ['position','top','left','overflow','opacity']; // Always restore
		var props2 = ['width','height','overflow']; // Copy for children
		var cProps = ['fontSize'];
		var vProps = ['borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom'];
		var hProps = ['borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight'];

		// Set options
		var mode = $.effects.setMode(el, o.options.mode || 'effect'); // Set Mode
		var restore = o.options.restore || false; // Default restore
		var scale = o.options.scale || 'both'; // Default scale mode
		var origin = o.options.origin; // The origin of the sizing
		var original = {height: el.height(), width: el.width()}; // Save original
		el.from = o.options.from || original; // Default from state
		el.to = o.options.to || original; // Default to state
		// Adjust
		if (origin) { // Calculate baseline shifts
			var baseline = $.effects.getBaseline(origin, original);
			el.from.top = (original.height - el.from.height) * baseline.y;
			el.from.left = (original.width - el.from.width) * baseline.x;
			el.to.top = (original.height - el.to.height) * baseline.y;
			el.to.left = (original.width - el.to.width) * baseline.x;
		};
		var factor = { // Set scaling factor
			from: {y: el.from.height / original.height, x: el.from.width / original.width},
			to: {y: el.to.height / original.height, x: el.to.width / original.width}
		};
		if (scale == 'box' || scale == 'both') { // Scale the css box
			if (factor.from.y != factor.to.y) { // Vertical props scaling
				props = props.concat(vProps);
				el.from = $.effects.setTransition(el, vProps, factor.from.y, el.from);
				el.to = $.effects.setTransition(el, vProps, factor.to.y, el.to);
			};
			if (factor.from.x != factor.to.x) { // Horizontal props scaling
				props = props.concat(hProps);
				el.from = $.effects.setTransition(el, hProps, factor.from.x, el.from);
				el.to = $.effects.setTransition(el, hProps, factor.to.x, el.to);
			};
		};
		if (scale == 'content' || scale == 'both') { // Scale the content
			if (factor.from.y != factor.to.y) { // Vertical props scaling
				props = props.concat(cProps);
				el.from = $.effects.setTransition(el, cProps, factor.from.y, el.from);
				el.to = $.effects.setTransition(el, cProps, factor.to.y, el.to);
			};
		};
		$.effects.save(el, restore ? props : props1); el.show(); // Save & Show
		$.effects.createWrapper(el); // Create Wrapper
		el.css('overflow','hidden').css(el.from); // Shift

		// Animate
		if (scale == 'content' || scale == 'both') { // Scale the children
			vProps = vProps.concat(['marginTop','marginBottom']).concat(cProps); // Add margins/font-size
			hProps = hProps.concat(['marginLeft','marginRight']); // Add margins
			props2 = props.concat(vProps).concat(hProps); // Concat
			el.find("*[width]").each(function(){
				child = $(this);
				if (restore) $.effects.save(child, props2);
				var c_original = {height: child.height(), width: child.width()}; // Save original
				child.from = {height: c_original.height * factor.from.y, width: c_original.width * factor.from.x};
				child.to = {height: c_original.height * factor.to.y, width: c_original.width * factor.to.x};
				if (factor.from.y != factor.to.y) { // Vertical props scaling
					child.from = $.effects.setTransition(child, vProps, factor.from.y, child.from);
					child.to = $.effects.setTransition(child, vProps, factor.to.y, child.to);
				};
				if (factor.from.x != factor.to.x) { // Horizontal props scaling
					child.from = $.effects.setTransition(child, hProps, factor.from.x, child.from);
					child.to = $.effects.setTransition(child, hProps, factor.to.x, child.to);
				};
				child.css(child.from); // Shift children
				child.animate(child.to, o.duration, o.options.easing, function(){
					if (restore) $.effects.restore(child, props2); // Restore children
				}); // Animate children
			});
		};

		// Animate
		el.animate(el.to, { queue: false, duration: o.duration, easing: o.options.easing, complete: function() {
			if(mode == 'hide') el.hide(); // Hide
			$.effects.restore(el, restore ? props : props1); $.effects.removeWrapper(el); // Restore
			if(o.callback) o.callback.apply(this, arguments); // Callback
			el.dequeue();
		}});

	});

};

})(jQuery);
/*
 * jQuery UI Effects Shake 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Shake
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.shake = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this), props = ['position','top','left'];

		// Set options
		var mode = $.effects.setMode(el, o.options.mode || 'effect'); // Set Mode
		var direction = o.options.direction || 'left'; // Default direction
		var distance = o.options.distance || 20; // Default distance
		var times = o.options.times || 3; // Default # of times
		var speed = o.duration || o.options.duration || 140; // Default speed per shake

		// Adjust
		$.effects.save(el, props); el.show(); // Save & Show
		$.effects.createWrapper(el); // Create Wrapper
		var ref = (direction == 'up' || direction == 'down') ? 'top' : 'left';
		var motion = (direction == 'up' || direction == 'left') ? 'pos' : 'neg';

		// Animation
		var animation = {}, animation1 = {}, animation2 = {};
		animation[ref] = (motion == 'pos' ? '-=' : '+=')  + distance;
		animation1[ref] = (motion == 'pos' ? '+=' : '-=')  + distance * 2;
		animation2[ref] = (motion == 'pos' ? '-=' : '+=')  + distance * 2;

		// Animate
		el.animate(animation, speed, o.options.easing);
		for (var i = 1; i < times; i++) { // Shakes
			el.animate(animation1, speed, o.options.easing).animate(animation2, speed, o.options.easing);
		};
		el.animate(animation1, speed, o.options.easing).
		animate(animation, speed / 2, o.options.easing, function(){ // Last shake
			$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore
			if(o.callback) o.callback.apply(this, arguments); // Callback
		});
		el.queue('fx', function() { el.dequeue(); });
		el.dequeue();
	});

};

})(jQuery);
/*
 * jQuery UI Effects Slide 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Slide
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.slide = function(o) {

	return this.queue(function() {

		// Create element
		var el = $(this), props = ['position','top','left'];

		// Set options
		var mode = $.effects.setMode(el, o.options.mode || 'show'); // Set Mode
		var direction = o.options.direction || 'left'; // Default Direction

		// Adjust
		$.effects.save(el, props); el.show(); // Save & Show
		$.effects.createWrapper(el).css({overflow:'hidden'}); // Create Wrapper
		var ref = (direction == 'up' || direction == 'down') ? 'top' : 'left';
		var motion = (direction == 'up' || direction == 'left') ? 'pos' : 'neg';
		var distance = o.options.distance || (ref == 'top' ? el.outerHeight({margin:true}) : el.outerWidth({margin:true}));
		if (mode == 'show') el.css(ref, motion == 'pos' ? -distance : distance); // Shift

		// Animation
		var animation = {};
		animation[ref] = (mode == 'show' ? (motion == 'pos' ? '+=' : '-=') : (motion == 'pos' ? '-=' : '+=')) + distance;

		// Animate
		el.animate(animation, { queue: false, duration: o.duration, easing: o.options.easing, complete: function() {
			if(mode == 'hide') el.hide(); // Hide
			$.effects.restore(el, props); $.effects.removeWrapper(el); // Restore
			if(o.callback) o.callback.apply(this, arguments); // Callback
			el.dequeue();
		}});

	});

};

})(jQuery);
/*
 * jQuery UI Effects Transfer 1.7.1
 *
 * Copyright (c) 2009 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Effects/Transfer
 *
 * Depends:
 *	effects.core.js
 */
(function($) {

$.effects.transfer = function(o) {
	return this.queue(function() {
		var elem = $(this),
			target = $(o.options.to),
			endPosition = target.offset(),
			animation = {
				top: endPosition.top,
				left: endPosition.left,
				height: target.innerHeight(),
				width: target.innerWidth()
			},
			startPosition = elem.offset(),
			transfer = $('<div class="ui-effects-transfer"></div>')
				.appendTo(document.body)
				.addClass(o.options.className)
				.css({
					top: startPosition.top,
					left: startPosition.left,
					height: elem.innerHeight(),
					width: elem.innerWidth(),
					position: 'absolute'
				})
				.animate(animation, o.duration, o.options.easing, function() {
					transfer.remove();
					(o.callback && o.callback.apply(elem[0], arguments));
					elem.dequeue();
				});
	});
};

})(jQuery);

/*
 * jQuery Form Plugin
 * version: 2.17 (06-NOV-2008)
 * @requires jQuery v1.2.2 or later
 *
 * Examples and documentation at: http://malsup.com/jquery/form/
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id$
 */
;(function($) {

/*
    Usage Note:  
    -----------
    Do not use both ajaxSubmit and ajaxForm on the same form.  These
    functions are intended to be exclusive.  Use ajaxSubmit if you want
    to bind your own submit handler to the form.  For example,

    $(document).ready(function() {
        $('#myForm').bind('submit', function() {
            $(this).ajaxSubmit({
                target: '#output'
            });
            return false; // <-- important!
        });
    });

    Use ajaxForm when you want the plugin to manage all the event binding
    for you.  For example,

    $(document).ready(function() {
        $('#myForm').ajaxForm({
            target: '#output'
        });
    });
        
    When using ajaxForm, the ajaxSubmit function will be invoked for you
    at the appropriate time.  
*/

/**
 * ajaxSubmit() provides a mechanism for immediately submitting 
 * an HTML form using AJAX.
 */
$.fn.ajaxSubmit = function(options) {
    // fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
    if (!this.length) {
        log('ajaxSubmit: skipping submit process - no element selected');
        return this;
    }

    if (typeof options == 'function')
        options = { success: options };

    options = $.extend({
        url:  this.attr('action') || window.location.toString(),
        type: this.attr('method') || 'GET'
    }, options || {});

    // hook for manipulating the form data before it is extracted;
    // convenient for use with rich editors like tinyMCE or FCKEditor
    var veto = {};
    this.trigger('form-pre-serialize', [this, options, veto]);
    if (veto.veto) {
        log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
        return this;
    }

    // provide opportunity to alter form data before it is serialized
    if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
        log('ajaxSubmit: submit aborted via beforeSerialize callback');
        return this;
    }    
   
    var a = this.formToArray(options.semantic);
    if (options.data) {
        options.extraData = options.data;
        for (var n in options.data) {
          if(options.data[n] instanceof Array) {
            for (var k in options.data[n])
              a.push( { name: n, value: options.data[n][k] } )
          }  
          else
             a.push( { name: n, value: options.data[n] } );
        }
    }

    // give pre-submit callback an opportunity to abort the submit
    if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
        log('ajaxSubmit: submit aborted via beforeSubmit callback');
        return this;
    }    

    // fire vetoable 'validate' event
    this.trigger('form-submit-validate', [a, this, options, veto]);
    if (veto.veto) {
        log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
        return this;
    }    

    var q = $.param(a);

    if (options.type.toUpperCase() == 'GET') {
        options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
        options.data = null;  // data is null for 'get'
    }
    else
        options.data = q; // data is the query string for 'post'

    var $form = this, callbacks = [];
    if (options.resetForm) callbacks.push(function() { $form.resetForm(); });
    if (options.clearForm) callbacks.push(function() { $form.clearForm(); });

    // perform a load on the target only if dataType is not provided
    if (!options.dataType && options.target) {
        var oldSuccess = options.success || function(){};
        callbacks.push(function(data) {
            $(options.target).html(data).each(oldSuccess, arguments);
        });
    }
    else if (options.success)
        callbacks.push(options.success);

    options.success = function(data, status) {
        for (var i=0, max=callbacks.length; i < max; i++)
            callbacks[i].apply(options, [data, status, $form]);
    };

    // are there files to upload?
    var files = $('input:file', this).fieldValue();
    var found = false;
    for (var j=0; j < files.length; j++)
        if (files[j])
            found = true;

    // options.iframe allows user to force iframe mode
   if (options.iframe || found) { 
       // hack to fix Safari hang (thanks to Tim Molendijk for this)
       // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
       if ($.browser.safari && options.closeKeepAlive)
           $.get(options.closeKeepAlive, fileUpload);
       else
           fileUpload();
       }
   else
       $.ajax(options);

    // fire 'notify' event
    this.trigger('form-submit-notify', [this, options]);
    return this;


    // private function for handling file uploads (hat tip to YAHOO!)
    function fileUpload() {
        var form = $form[0];
        
        if ($(':input[@name=submit]', form).length) {
            alert('Error: Form elements must not be named "submit".');
            return;
        }
        
        var opts = $.extend({}, $.ajaxSettings, options);
		var s = jQuery.extend(true, {}, $.extend(true, {}, $.ajaxSettings), opts);

        var id = 'jqFormIO' + (new Date().getTime());
        var $io = $('<iframe id="' + id + '" name="' + id + '" />');
        var io = $io[0];

        if ($.browser.msie || $.browser.opera) 
            io.src = 'javascript:false;document.write("");';
        $io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });

        var xhr = { // mock object
            aborted: 0,
            responseText: null,
            responseXML: null,
            status: 0,
            statusText: 'n/a',
            getAllResponseHeaders: function() {},
            getResponseHeader: function() {},
            setRequestHeader: function() {},
            abort: function() { 
                this.aborted = 1; 
                $io.attr('src','about:blank'); // abort op in progress
            }
        };

        var g = opts.global;
        // trigger ajax global events so that activity/block indicators work like normal
        if (g && ! $.active++) $.event.trigger("ajaxStart");
        if (g) $.event.trigger("ajaxSend", [xhr, opts]);

		if (s.beforeSend && s.beforeSend(xhr, s) === false) {
			s.global && jQuery.active--;
			return;
        }
        if (xhr.aborted)
            return;
        
        var cbInvoked = 0;
        var timedOut = 0;

        // add submitting element to data if we know it
        var sub = form.clk;
        if (sub) {
            var n = sub.name;
            if (n && !sub.disabled) {
                options.extraData = options.extraData || {};
                options.extraData[n] = sub.value;
                if (sub.type == "image") {
                    options.extraData[name+'.x'] = form.clk_x;
                    options.extraData[name+'.y'] = form.clk_y;
                }
            }
        }

        // take a breath so that pending repaints get some cpu time before the upload starts
        setTimeout(function() {
            // make sure form attrs are set
            var t = $form.attr('target'), a = $form.attr('action');
            $form.attr({
                target:   id,
                method:   'POST',
                action:   opts.url
            });
            
            // ie borks in some cases when setting encoding
            if (! options.skipEncodingOverride) {
                $form.attr({
                    encoding: 'multipart/form-data',
                    enctype:  'multipart/form-data'
                });
            }

            // support timout
            if (opts.timeout)
                setTimeout(function() { timedOut = true; cb(); }, opts.timeout);

            // add "extra" data to form if provided in options
            var extraInputs = [];
            try {
                if (options.extraData)
                    for (var n in options.extraData)
                        extraInputs.push(
                            $('<input type="hidden" name="'+n+'" value="'+options.extraData[n]+'" />')
                                .appendTo(form)[0]);
            
                // add iframe to doc and submit the form
                $io.appendTo('body');
                io.attachEvent ? io.attachEvent('onload', cb) : io.addEventListener('load', cb, false);
                form.submit();
            }
            finally {
                // reset attrs and remove "extra" input elements
                $form.attr('action', a);
                t ? $form.attr('target', t) : $form.removeAttr('target');
                $(extraInputs).remove();
            }
        }, 10);

        function cb() {
            if (cbInvoked++) return;
            
            io.detachEvent ? io.detachEvent('onload', cb) : io.removeEventListener('load', cb, false);

            var operaHack = 0;
            var ok = true;
            try {
                if (timedOut) throw 'timeout';
                // extract the server response from the iframe
                var data, doc;

                doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;
                
                if (doc.body == null && !operaHack && $.browser.opera) {
                    // In Opera 9.2.x the iframe DOM is not always traversable when
                    // the onload callback fires so we give Opera 100ms to right itself
                    operaHack = 1;
                    cbInvoked--;
                    setTimeout(cb, 100);
                    return;
                }
                
                xhr.responseText = doc.body ? doc.body.innerHTML : null;
                xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
                xhr.getResponseHeader = function(header){
                    var headers = {'content-type': opts.dataType};
                    return headers[header];
                };

                if (opts.dataType == 'json' || opts.dataType == 'script') {
                    var ta = doc.getElementsByTagName('textarea')[0];
                    xhr.responseText = ta ? ta.value : xhr.responseText;
                }
                else if (opts.dataType == 'xml' && !xhr.responseXML && xhr.responseText != null) {
                    xhr.responseXML = toXml(xhr.responseText);
                }
                data = $.httpData(xhr, opts.dataType);
            }
            catch(e){
                ok = false;
                $.handleError(opts, xhr, 'error', e);
            }

            // ordering of these callbacks/triggers is odd, but that's how $.ajax does it
            if (ok) {
                opts.success(data, 'success');
                if (g) $.event.trigger("ajaxSuccess", [xhr, opts]);
            }
            if (g) $.event.trigger("ajaxComplete", [xhr, opts]);
            if (g && ! --$.active) $.event.trigger("ajaxStop");
            if (opts.complete) opts.complete(xhr, ok ? 'success' : 'error');

            // clean up
            setTimeout(function() {
                $io.remove();
                xhr.responseXML = null;
            }, 100);
        };

        function toXml(s, doc) {
            if (window.ActiveXObject) {
                doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.async = 'false';
                doc.loadXML(s);
            }
            else
                doc = (new DOMParser()).parseFromString(s, 'text/xml');
            return (doc && doc.documentElement && doc.documentElement.tagName != 'parsererror') ? doc : null;
        };
    };
};

/**
 * ajaxForm() provides a mechanism for fully automating form submission.
 *
 * The advantages of using this method instead of ajaxSubmit() are:
 *
 * 1: This method will include coordinates for <input type="image" /> elements (if the element
 *    is used to submit the form).
 * 2. This method will include the submit element's name/value data (for the element that was
 *    used to submit the form).
 * 3. This method binds the submit() method to the form for you.
 *
 * The options argument for ajaxForm works exactly as it does for ajaxSubmit.  ajaxForm merely
 * passes the options argument along after properly binding events for submit elements and
 * the form itself.
 */ 
$.fn.ajaxForm = function(options) {
    return this.ajaxFormUnbind().bind('submit.form-plugin',function() {
        $(this).ajaxSubmit(options);
        return false;
    }).each(function() {
        // store options in hash
        $(":submit,input:image", this).bind('click.form-plugin',function(e) {
            var form = this.form;
            form.clk = this;
            if (this.type == 'image') {
                if (e.offsetX != undefined) {
                    form.clk_x = e.offsetX;
                    form.clk_y = e.offsetY;
                } else if (typeof $.fn.offset == 'function') { // try to use dimensions plugin
                    var offset = $(this).offset();
                    form.clk_x = e.pageX - offset.left;
                    form.clk_y = e.pageY - offset.top;
                } else {
                    form.clk_x = e.pageX - this.offsetLeft;
                    form.clk_y = e.pageY - this.offsetTop;
                }
            }
            // clear form vars
            setTimeout(function() { form.clk = form.clk_x = form.clk_y = null; }, 10);
        });
    });
};

// ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
$.fn.ajaxFormUnbind = function() {
    this.unbind('submit.form-plugin');
    return this.each(function() {
        $(":submit,input:image", this).unbind('click.form-plugin');
    });

};

/**
 * formToArray() gathers form element data into an array of objects that can
 * be passed to any of the following ajax functions: $.get, $.post, or load.
 * Each object in the array has both a 'name' and 'value' property.  An example of
 * an array for a simple login form might be:
 *
 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
 *
 * It is this array that is passed to pre-submit callback functions provided to the
 * ajaxSubmit() and ajaxForm() methods.
 */
$.fn.formToArray = function(semantic) {
    var a = [];
    if (this.length == 0) return a;

    var form = this[0];
    var els = semantic ? form.getElementsByTagName('*') : form.elements;
    if (!els) return a;
    for(var i=0, max=els.length; i < max; i++) {
        var el = els[i];
        var n = el.name;
        if (!n) continue;

        if (semantic && form.clk && el.type == "image") {
            // handle image inputs on the fly when semantic == true
            if(!el.disabled && form.clk == el)
                a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
            continue;
        }

        var v = $.fieldValue(el, true);
        if (v && v.constructor == Array) {
            for(var j=0, jmax=v.length; j < jmax; j++)
                a.push({name: n, value: v[j]});
        }
        else if (v !== null && typeof v != 'undefined')
            a.push({name: n, value: v});
    }

    if (!semantic && form.clk) {
        // input type=='image' are not found in elements array! handle them here
        var inputs = form.getElementsByTagName("input");
        for(var i=0, max=inputs.length; i < max; i++) {
            var input = inputs[i];
            var n = input.name;
            if(n && !input.disabled && input.type == "image" && form.clk == input)
                a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
        }
    }
    return a;
};

/**
 * Serializes form data into a 'submittable' string. This method will return a string
 * in the format: name1=value1&amp;name2=value2
 */
$.fn.formSerialize = function(semantic) {
    //hand off to jQuery.param for proper encoding
    return $.param(this.formToArray(semantic));
};

/**
 * Serializes all field elements in the jQuery object into a query string.
 * This method will return a string in the format: name1=value1&amp;name2=value2
 */
$.fn.fieldSerialize = function(successful) {
    var a = [];
    this.each(function() {
        var n = this.name;
        if (!n) return;
        var v = $.fieldValue(this, successful);
        if (v && v.constructor == Array) {
            for (var i=0,max=v.length; i < max; i++)
                a.push({name: n, value: v[i]});
        }
        else if (v !== null && typeof v != 'undefined')
            a.push({name: this.name, value: v});
    });
    //hand off to jQuery.param for proper encoding
    return $.param(a);
};

/**
 * Returns the value(s) of the element in the matched set.  For example, consider the following form:
 *
 *  <form><fieldset>
 *      <input name="A" type="text" />
 *      <input name="A" type="text" />
 *      <input name="B" type="checkbox" value="B1" />
 *      <input name="B" type="checkbox" value="B2"/>
 *      <input name="C" type="radio" value="C1" />
 *      <input name="C" type="radio" value="C2" />
 *  </fieldset></form>
 *
 *  var v = $(':text').fieldValue();
 *  // if no values are entered into the text inputs
 *  v == ['','']
 *  // if values entered into the text inputs are 'foo' and 'bar'
 *  v == ['foo','bar']
 *
 *  var v = $(':checkbox').fieldValue();
 *  // if neither checkbox is checked
 *  v === undefined
 *  // if both checkboxes are checked
 *  v == ['B1', 'B2']
 *
 *  var v = $(':radio').fieldValue();
 *  // if neither radio is checked
 *  v === undefined
 *  // if first radio is checked
 *  v == ['C1']
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If this value is false the value(s)
 * for each element is returned.
 *
 * Note: This method *always* returns an array.  If no valid value can be determined the
 *       array will be empty, otherwise it will contain one or more values.
 */
$.fn.fieldValue = function(successful) {
    for (var val=[], i=0, max=this.length; i < max; i++) {
        var el = this[i];
        var v = $.fieldValue(el, successful);
        if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length))
            continue;
        v.constructor == Array ? $.merge(val, v) : val.push(v);
    }
    return val;
};

/**
 * Returns the value of the field element.
 */
$.fieldValue = function(el, successful) {
    var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
    if (typeof successful == 'undefined') successful = true;

    if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
        (t == 'checkbox' || t == 'radio') && !el.checked ||
        (t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
        tag == 'select' && el.selectedIndex == -1))
            return null;

    if (tag == 'select') {
        var index = el.selectedIndex;
        if (index < 0) return null;
        var a = [], ops = el.options;
        var one = (t == 'select-one');
        var max = (one ? index+1 : ops.length);
        for(var i=(one ? index : 0); i < max; i++) {
            var op = ops[i];
            if (op.selected) {
                // extra pain for IE...
                var v = $.browser.msie && !(op.attributes['value'].specified) ? op.text : op.value;
                if (one) return v;
                a.push(v);
            }
        }
        return a;
    }
    return el.value;
};

/**
 * Clears the form data.  Takes the following actions on the form's input fields:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 */
$.fn.clearForm = function() {
    return this.each(function() {
        $('input,select,textarea', this).clearFields();
    });
};

/**
 * Clears the selected form elements.
 */
$.fn.clearFields = $.fn.clearInputs = function() {
    return this.each(function() {
        var t = this.type, tag = this.tagName.toLowerCase();
        if (t == 'text' || t == 'password' || tag == 'textarea')
            this.value = '';
        else if (t == 'checkbox' || t == 'radio')
            this.checked = false;
        else if (tag == 'select')
            this.selectedIndex = -1;
    });
};

/**
 * Resets the form data.  Causes all form elements to be reset to their original value.
 */
$.fn.resetForm = function() {
    return this.each(function() {
        // guard against an input with the name of 'reset'
        // note that IE reports the reset function as an 'object'
        if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType))
            this.reset();
    });
};

/**
 * Enables or disables any matching elements.
 */
$.fn.enable = function(b) { 
    if (b == undefined) b = true;
    return this.each(function() { 
        this.disabled = !b 
    });
};

/**
 * Checks/unchecks any matching checkboxes or radio buttons and
 * selects/deselects and matching option elements.
 */
$.fn.selected = function(select) {
    if (select == undefined) select = true;
    return this.each(function() { 
        var t = this.type;
        if (t == 'checkbox' || t == 'radio')
            this.checked = select;
        else if (this.tagName.toLowerCase() == 'option') {
            var $sel = $(this).parent('select');
            if (select && $sel[0] && $sel[0].type == 'select-one') {
                // deselect all other options
                $sel.find('option').selected(false);
            }
            this.selected = select;
        }
    });
};

// helper fn for console logging
// set $.fn.ajaxSubmit.debug to true to enable debug logging
function log() {
    if ($.fn.ajaxSubmit.debug && window.console && window.console.log)
        window.console.log('[jquery.form] ' + Array.prototype.join.call(arguments,''));
};

})(jQuery);

/******************************************************************************************************************************

 * @ Original idea by by Binny V A, Original version: 2.00.A 
 * @ http://www.openjs.com/scripts/events/keyboard_shortcuts/
 * @ Original License : BSD
 
 * @ jQuery Plugin by Tzury Bar Yochay 
        mail: tzury.by@gmail.com
        blog: evalinux.wordpress.com
        face: facebook.com/profile.php?id=513676303
        
        (c) Copyrights 2007
        
 * @ jQuery Plugin version Beta (0.0.2)
 * @ License: jQuery-License.
 
TODO:
    add queue support (as in gmail) e.g. 'x' then 'y', etc.
    add mouse + mouse wheel events.

USAGE:
    $.hotkeys.add('Ctrl+c', function(){ alert('copy anyone?');});
    $.hotkeys.add('Ctrl+c', {target:'div#editor', type:'keyup', propagate: true},function(){ alert('copy anyone?');});>
    $.hotkeys.remove('Ctrl+c'); 
    $.hotkeys.remove('Ctrl+c', {target:'div#editor', type:'keypress'}); 
    
******************************************************************************************************************************/
(function (jQuery){
    this.version = '(beta)(0.0.3)';
	this.all = {};
    this.special_keys = {
        27: 'esc', 9: 'tab', 32:'space', 13: 'return', 8:'backspace', 145: 'scroll', 20: 'capslock', 
        144: 'numlock', 19:'pause', 45:'insert', 36:'home', 46:'del',35:'end', 33: 'pageup', 
        34:'pagedown', 37:'left', 38:'up', 39:'right',40:'down', 112:'f1',113:'f2', 114:'f3', 
        115:'f4', 116:'f5', 117:'f6', 118:'f7', 119:'f8', 120:'f9', 121:'f10', 122:'f11', 123:'f12'};
        
    this.shift_nums = { "`":"~", "1":"!", "2":"@", "3":"#", "4":"$", "5":"%", "6":"^", "7":"&", 
        "8":"*", "9":"(", "0":")", "-":"_", "=":"+", ";":":", "'":"\"", ",":"<", 
        ".":">",  "/":"?",  "\\":"|" };
        
    this.add = function(combi, options, callback) {
        if (jQuery.isFunction(options)){
            callback = options;
            options = {};
        }
        var opt = {},
            defaults = {type: 'keydown', propagate: false, disableInInput: false, target: jQuery('html')[0], checkParent: true},
            that = this;
        opt = jQuery.extend( opt , defaults, options || {} );
        combi = combi.toLowerCase();        
        
        // inspect if keystroke matches
        var inspector = function(event) {
            event = jQuery.event.fix(event); // jQuery event normalization.
            var element = event.target;
            // @ TextNode -> nodeType == 3
            element = (element.nodeType==3) ? element.parentNode : element;
            
            if(opt['disableInInput']) { // Disable shortcut keys in Input, Textarea fields
                var target = jQuery(element);
                if( target.is("input") || target.is("textarea")){
                    return;
                }
            }
            var code = event.which,
                type = event.type,
                character = String.fromCharCode(code).toLowerCase(),
                special = that.special_keys[code],
                shift = event.shiftKey,
                ctrl = event.ctrlKey,
                alt= event.altKey,
                propagate = true, // default behaivour
                mapPoint = null;
            
            // in opera + safari, the event.target is unpredictable.
            // for example: 'keydown' might be associated with HtmlBodyElement 
            // or the element where you last clicked with your mouse.
            if (jQuery.browser.opera || jQuery.browser.safari || opt.checkParent){
                while (!that.all[element] && element.parentNode){
                    element = element.parentNode;
                }
            }
            
            var cbMap = that.all[element].events[type].callbackMap;
            if(!shift && !ctrl && !alt) { // No Modifiers
                mapPoint = cbMap[special] ||  cbMap[character]
			}
            // deals with combinaitons (alt|ctrl|shift+anything)
            else{
                var modif = '';
                if(alt) modif +='alt+';
                if(ctrl) modif+= 'ctrl+';
                if(shift) modif += 'shift+';
                // modifiers + special keys or modifiers + characters or modifiers + shift characters
                mapPoint = cbMap[modif+special] || cbMap[modif+character] || cbMap[modif+that.shift_nums[character]]
            }
            if (mapPoint){
                mapPoint.cb(event);
                if(!mapPoint.propagate) {
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }
            }
		};        
        // first hook for this element
        if (!this.all[opt.target]){
            this.all[opt.target] = {events:{}};
        }
        if (!this.all[opt.target].events[opt.type]){
            this.all[opt.target].events[opt.type] = {callbackMap: {}}
            jQuery.event.add(opt.target, opt.type, inspector);
        }        
        this.all[opt.target].events[opt.type].callbackMap[combi] =  {cb: callback, propagate:opt.propagate};                
        return jQuery;
	};    
    this.remove = function(exp, opt) {
        opt = opt || {};
        target = opt.target || jQuery('html')[0];
        type = opt.type || 'keydown';
		exp = exp.toLowerCase();        
        delete this.all[target].events[type].callbackMap[exp]        
        return jQuery;
	};
    jQuery.hotkeys = this;
    return jQuery;    
})(jQuery);
/* 
 * More info at: http://kevin.vanzonneveld.net/techblog/article/phpjs_licensing/
 * 
 * This is version: 2.20
 * php.js is copyright 2008 Kevin van Zonneveld.
 * 
 * Portions copyright Brett Zamir, Onno Marsman, Michael White
 * (http://getsprink.com), Waldo Malqui Silva, Paulo Ricardo F. Santos, Jack,
 * Jonas Raoni Soares Silva (http://www.jsfromhell.com), Philip Peterson, Ates
 * Goral (http://magnetiq.com), Legaev Andrey, Martijn Wieringa, Nate, Enrique
 * Gonzalez, Philippe Baumann, Webtoolkit.info (http://www.webtoolkit.info/),
 * Ash Searle (http://hexmen.com/blog/), Carlos R. L. Rodrigues
 * (http://www.jsfromhell.com), Jani Hartikainen, Erkekjetter, GeekFG
 * (http://geekfg.blogspot.com), Johnny Mast (http://www.phpvrouwen.nl), d3x,
 * marrtins, AJ, Alex, Alfonso Jimenez (http://www.alfonsojimenez.com), Aman
 * Gupta, Arpad Ray (mailto:arpad@php.net), David, Karol Kowalski, Marc Palau,
 * Mirek Slugen, Public Domain (http://www.json.org/json2.js), Sakimori, Steve
 * Hilder, Steven Levithan (http://blog.stevenlevithan.com), Thunder.m, Tyler
 * Akins (http://rumkin.com), gorthaur, mdsjack (http://www.mdsjack.bo.it),
 * 0m3r, Alexander Ermolaev
 * (http://snippets.dzone.com/user/AlexanderErmolaev), Allan Jensen
 * (http://www.winternet.no), Andrea Giammarchi
 * (http://webreflection.blogspot.com), Andreas, Andrej Pavlovic, Anton
 * Ongson, Arno, Atli Þór, Bayron Guevara, Ben Bryan, Benjamin Lupton, Brad
 * Touesnard, Bryan Elliott, Cagri Ekin, Caio Ariede (http://caioariede.com),
 * ChaosNo1, Christian Doebler, Cord, David James, David Randall, Der Simon
 * (http://innerdom.sourceforge.net/), Dino, Diogo Resende, Douglas Crockford
 * (http://javascript.crockford.com), DxGx, FGFEmperor, Felix Geisendoerfer
 * (http://www.debuggable.com/felix), Francesco, Francois, FremyCompany,
 * Gabriel Paderni, Garagoth, Gilbert, Howard Yeend, Hyam Singer
 * (http://www.impact-computing.com/), J A R, Jalal Berrami, Kirk Strobeck,
 * Kristof Coomans (SCK-CEN (Belgian Nucleair Research Centre)), LH, Leslie
 * Hoare, Lincoln Ramsay, Linuxworld, Luke Godfrey, Luke Smith
 * (http://lucassmith.name), Manish, Martin Pool, Mateusz "loonquawl" Zalega,
 * Matt Bradley, MeEtc (http://yass.meetcweb.com), Mick@el, Nathan, Nick
 * Callen, Norman "zEh" Fuchs, Ozh, Paul, Pedro Tainha
 * (http://www.pedrotainha.com), Peter-Paul Koch
 * (http://www.quirksmode.org/js/beat.html), Pierre-Luc Paour, Pul, Pyerre,
 * ReverseSyntax, Rival, Robin, Sanjoy Roy, Saulo Vallory, Scott Cariss, Simon
 * Willison (http://simonwillison.net), Slawomir Kaniecki, Steve Clay,
 * Subhasis Deb, T. Wild, T.Wild, T0bsn, Thiago Mata
 * (http://thiagomata.blog.com), Tim Wiel, Tod Gentille, Valentina De Rosa,
 * Victor, XoraX (http://www.xorax.info), Yannoo, Yves Sucaet, baris ozdil,
 * booeyOH, class_exists, djmix, dptr1988, duncan, echo is bad, ejsanders,
 * gabriel paderni, ger, hitwork, jakes, john (http://www.jd-tech.net),
 * johnrembo, kenneth, marc andreu, metjay, nobbler, noname, penutbutterjelly,
 * rezna, sankai, sowberry, stensi, taith
 * 
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL KEVIN VAN ZONNEVELD BE LIABLE FOR ANY CLAIM, DAMAGES
 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */ 


// {{{ array
function array( ) {
    // #!#!#!#!# array::$descr1 does not contain valid 'array' at line 260
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array/
    // +       version: 809.522
    // +   original by: d3x
    // *     example 1: array('Kevin', 'van', 'Zonneveld');
    // *     returns 1: ['Kevin', 'van', 'Zonneveld']

    return Array.prototype.slice.call(arguments);
}// }}}

// {{{ array_change_key_case
function array_change_key_case( array ) {
    // Changes all keys in an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_change_key_case/
    // +       version: 901.817
    // +   original by: Ates Goral (http://magnetiq.com)
    // +   improved by: marrtins
    // *     example 1: array_change_key_case(42);
    // *     returns 1: false
    // *     example 2: array_change_key_case([ 3, 5 ]);
    // *     returns 2: {0: 3, 1: 5}
    // *     example 3: array_change_key_case({ FuBaR: 42 });
    // *     returns 3: {"fubar": 42}
    // *     example 4: array_change_key_case({ FuBaR: 42 }, 'CASE_LOWER');
    // *     returns 4: {"fubar": 42}
    // *     example 5: array_change_key_case({ FuBaR: 42 }, 'CASE_UPPER');
    // *     returns 5: {"FUBAR": 42}
    // *     example 6: array_change_key_case({ FuBaR: 42 }, 2);
    // *     returns 6: {"FUBAR": 42}

    var case_fn, tmp_ar = new Object, argc = arguments.length, argv = arguments, key;

    if (array instanceof Array) {
        return array; 
    }

    if (array instanceof Object) {
        if( argc == 1 || argv[1] == 'CASE_LOWER' || argv[1] == 0 ){
            case_fn = "toLowerCase";
        } else{
            case_fn = "toUpperCase";
        }
        for (key in array) {
            tmp_ar[key[case_fn]()] = array[key];
        }
        return tmp_ar;
    }

    return false;
}// }}}

// {{{ array_chunk
function array_chunk( input, size ) {
    // Split an array into chunks
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_chunk/
    // +       version: 809.522
    // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // *     example 1: array_chunk(['Kevin', 'van', 'Zonneveld'], 2);
    // *     returns 1: {0 : {0: 'Kevin', 1: 'van'} , 1 : {0: 'Zonneveld'}}
 
    for(var x, i = 0, c = -1, l = input.length, n = []; i < l; i++){
        (x = i % size) ? n[c][x] = input[i] : n[++c] = [input[i]];
    }

    return n;
}// }}}

// {{{ array_combine
function array_combine( keys, values ) {
    // Creates an array by using one array for keys and another for its values
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_combine/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_combine([0,1,2], ['kevin','van','zonneveld']);
    // *     returns 1: {0: 'kevin', 1: 'van', 2: 'zonneveld'}
   
    var new_array = {}, keycount=keys.length, i;

    // input sanitation
    if( !keys || !values || keys.constructor !== Array || values.constructor !== Array ){
        return false;
    }

    // number of elements does not match
    if(keycount != values.length){
        return false;
    }

    for ( i=0; i < keycount; i++ ){
        new_array[keys[i]] = values[i];
    }

    return new_array;
}// }}}

// {{{ array_count_values
function array_count_values( array ) {
    // Counts all the values of an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_count_values/
    // +       version: 810.2018
    // +   original by: Ates Goral (http://magnetiq.com)
    // + namespaced by: Michael White (http://getsprink.com)
    // +      input by: sankai
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_count_values([ 3, 5, 3, "foo", "bar", "foo" ]);
    // *     returns 1: {3:2, 5:1, "foo":2, "bar":1}
    // *     example 2: array_count_values({ p1: 3, p2: 5, p3: 3, p4: "foo", p5: "bar", p6: "foo" });
    // *     returns 2: {3:2, 5:1, "foo":2, "bar":1}
    // *     example 3: array_count_values([ true, 4.2, 42, "fubar" ]);
    // *     returns 3: {42:1, "fubar":1}

    var tmp_arr = {}, key = '', t = '';
    
    var __getType = function(obj) {
        // Objects are php associative arrays.
        var t = typeof obj;
        t = t.toLowerCase();
        if (t == "object") {
            t = "array";
        }
        return t;
    }    

    var __countValue = function (value) {
        switch (typeof(value)) {
            case "number":
                if (Math.floor(value) != value) {
                    return;
                }
            case "string":
                if (value in this) {
                    ++this[value];
                } else {
                    this[value] = 1;
                }
        }
    };
    
    t = __getType(array);
    if (t == 'array') {
        for ( key in array ) {
            __countValue.call(tmp_arr, array[key]);
        }
    } 
    return tmp_arr;
}// }}}

// {{{ array_diff
function array_diff() {
    // Computes the difference of arrays
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_diff/
    // +       version: 901.1301
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Sanjoy Roy
    // +    revised by: Brett Zamir
    // *     example 1: array_diff(['Kevin', 'van', 'Zonneveld'], ['van', 'Zonneveld']);
    // *     returns 1: ['Kevin']

    var arr1 = arguments[0], retArr = {};
    var k1 = '', i = 1, k = '', arr = {};

    arr1keys:
    for (k1 in arr1) {
        for (i = 1; i < arguments.length; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (arr[k] === arr1[k1]) {
                    // If it reaches here, it was found in at least one array, so try next value
                    continue arr1keys; 
                }
            }
            retArr[k1] = arr1[k1];
        }
    }

    return retArr;
}// }}}

// {{{ array_diff_assoc
function array_diff_assoc() {
    // Computes the difference of arrays with additional index check
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_diff_assoc/
    // +       version: 901.1301
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: 0m3r
    // +    revised by: Brett Zamir
    // *     example 1: array_diff_assoc({0: 'Kevin', 1: 'van', 2: 'Zonneveld'}, {0: 'Kevin', 4: 'van', 5: 'Zonneveld'});
    // *     returns 1: {1: 'van', 2: 'Zonneveld'}

    var arr1 = arguments[0], retArr = {};
    var k1 = '', i = 1, k = '', arr = {};

    arr1keys:
    for (k1 in arr1) {
        for (i = 1; i < arguments.length; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (arr[k] === arr1[k1] && k === k1) {
                    // If it reaches here, it was found in at least one array, so try next value
                    continue arr1keys;
                }
            }
            retArr[k1] = arr1[k1];
        }
    }

    return retArr;
}// }}}

// {{{ array_diff_key
function array_diff_key() {
    // Computes the difference of arrays using keys for comparison
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_diff_key/
    // +       version: 901.1301
    // +   original by: Ates Goral (http://magnetiq.com)
    // +    revised by: Brett Zamir
    // *     example 1: array_diff_key({red: 1, green: 2, blue: 3, white: 4}, {red: 5});
    // *     returns 1: {"green":2, "blue":3, "white":4}
    // *     example 2: array_diff_key({red: 1, green: 2, blue: 3, white: 4}, {red: 5}, {red: 5});
    // *     returns 2: {"green":2, "blue":3, "white":4}

    var arr1 = arguments[0], retArr = {};
    var k1 = '', i = 1, k = '', arr = {};
 
    arr1keys:
    for (k1 in arr1) {
        for (i = 1; i < arguments.length; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (k === k1) {
                    // If it reaches here, it was found in at least one array, so try next value
                    continue arr1keys;
                }
            }
            retArr[k1] = arr1[k1];
        }
    }

    return retArr;
}// }}}

// {{{ array_diff_uassoc
function array_diff_uassoc() {
    // Computes the difference of arrays with additional index check which is performed
    // by a user supplied callback function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_diff_uassoc/
    // +       version: 901.1411
    // +   original by: Brett Zamir
    // *     example 1: $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
    // *     example 1: $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
    // *     example 1: array_diff_uassoc($array1, $array2, function(key1, key2){ return (key1 == key2 ? 0 : (key1 > key2 ? 1 : -1)); });
    // *     returns 1: {b: 'brown', c: 'blue', 0: 'red'}

    var arr1 = arguments[0], retArr = {}, cb = arguments[arguments.length-1];
    var arr = {}, i = 1, k1 = '', k = '';
    cb = (typeof cb === 'string') ? window[cb] : (cb instanceof Array) ? window[cb[0]][cb[1]] : cb;

    arr1keys:
    for (k1 in arr1) {
        for (i=1; i < arguments.length-1; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (arr[k] === arr1[k1] && cb(k, k1) === 0) {
                    // If it reaches here, it was found in at least one array, so try next value
                    continue arr1keys;
                }
            }
            retArr[k1] = arr1[k1];
        }
    }

    return retArr;
}// }}}

// {{{ array_diff_ukey
function array_diff_ukey() {
    // Computes the difference of arrays using a callback function on the keys for
    // comparison
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_diff_ukey/
    // +       version: 901.1411
    // +   original by: Brett Zamir
    // *     example 1: $array1 = {blue: 1, red: 2, green: 3, purple: 4}
    // *     example 1: $array2 = {green: 5, blue: 6, yellow: 7, cyan: 8}
    // *     example 1: array_diff_ukey($array1, $array2, function(key1, key2){ return (key1 == key2 ? 0 : (key1 > key2 ? 1 : -1)); });
    // *     returns 1: {red: 2, purple: 4}


    var arr1 = arguments[0], retArr = {}, cb = arguments[arguments.length-1];
    var arr = {}, i = 1, k1 = '', k = '';

    cb = (typeof cb === 'string') ? window[cb] : (cb instanceof Array) ? window[cb[0]][cb[1]] : cb;

    arr1keys:
    for (k1 in arr1) {
        for (i=1; i < arguments.length-1; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (cb(k, k1) === 0) {
                    // If it reaches here, it was found in at least one array, so try next value
                    continue arr1keys;
                }
            }
            retArr[k1] = arr1[k1];
        }
    }

    return retArr;
}// }}}

// {{{ array_fill
function array_fill( start_index, num, mixed_val ) {
    // Fill an array with values
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_fill/
    // +       version: 811.1314
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Waldo Malqui Silva
    // *     example 1: array_fill(5, 6, 'banana');
    // *     returns 1: { 5: 'banana', 6: 'banana', 7: 'banana', 8: 'banana', 9: 'banana', 10: 'banana' }

    var key, tmp_arr = {};

    if ( !isNaN ( start_index ) && !isNaN ( num ) ) {
        for( key = 0; key < num; key++ ) {
            tmp_arr[(key+start_index)] = mixed_val;
        }
    }

    return tmp_arr;
}// }}}

// {{{ array_fill_keys
function array_fill_keys (keys, value) {
    // Fill an array with values, specifying keys
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_fill_keys/
    // +       version: 811.2517
    // +   original by: Brett Zamir
    // +   bugfixed by: Brett Zamir
    // *     example 1: keys = {'a': 'foo', 2: 5, 3: 10, 4: 'bar'}
    // *     example 1: array_fill_keys(keys, 'banana')
    // *     returns 1: {"foo": "banana", 5: "banana", 10: "banana", "bar": "banana"}
    
    var retObj = {}, key = '';
    
    for (key in keys) {
        retObj[keys[key]] = value;
    }
    
    return retObj;
}// }}}

// {{{ array_filter
function array_filter (arr, func) {
    // Filters elements of an array using a callback function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_filter/
    // +       version: 811.1812
    // +   original by: Brett Zamir
    // %        note 1: Takes a function as an argument, not a function's name
    // *     example 1: var odd = function (num) {return (num & 1);}; 
    // *     example 1: array_filter({"a": 1, "b": 2, "c": 3, "d": 4, "e": 5}, odd);
    // *     returns 1: {"a": 1, "c": 3, "e": 5}
    // *     example 2: var even = function (num) {return (!(num & 1));}
    // *     example 2: array_filter([6, 7, 8, 9, 10, 11, 12], even);
    // *     returns 2: {0: 6, 2: 8, 4: 10, 6: 12} 
    
    var retObj = {}, k;
    
    for (k in arr) {
        if (func(arr[k])) {
            retObj[k] = arr[k];
        }
    }
    
    return retObj;
}// }}}

// {{{ array_flip
function array_flip( trans ) {
    // Exchanges all keys with their associated values in an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_flip/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_flip( {a: 1, b: 1, c: 2} );
    // *     returns 1: {1: 'b', 2: 'c'}

    var key, tmp_ar = {};

    for( key in trans ) {
        tmp_ar[trans[key]] = key;
    }

    return tmp_ar;
}// }}}

// {{{ array_intersect
function array_intersect() {
    // Computes the intersection of arrays
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_intersect/
    // +       version: 901.1301
    // +   original by: Brett Zamir
    // %        note 1: These only output associative arrays (would need to be
    // %        note 1: all numeric and counting from zero to be numeric)
    // *     example 1: $array1 = {'a' : 'green', 0:'red', 1: 'blue'};
    // *     example 1: $array2 = {'b' : 'green', 0:'yellow', 1:'red'};
    // *     example 1: $array3 = ['green', 'red'];
    // *     example 1: $result = array_intersect($array1, $array2, $array3);
    // *     returns 1: {0: 'red', a: 'green'}

    var arr1 = arguments[0], retArr = {};
    var k1 = '', arr = {}, i = 0, k = '';
    
    arr1keys:
    for (k1 in arr1) {
        arrs:
        for (i=1; i < arguments.length; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (arr[k] === arr1[k1]) {
                    if (i === arguments.length-1) {
                        retArr[k1] = arr1[k1];
                    }
                    // If the innermost loop always leads at least once to an equal value, continue the loop until done
                    continue arrs;
                }
            }
            // If it reaches here, it wasn't found in at least one array, so try next value
            continue arr1keys;
        }
    }

    return retArr;
}// }}}

// {{{ array_intersect_assoc
function array_intersect_assoc() {
    // Computes the intersection of arrays with additional index check
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_intersect_assoc/
    // +       version: 901.1301
    // +   original by: Brett Zamir
    // %        note 1: These only output associative arrays (would need to be
    // %        note 1: all numeric and counting from zero to be numeric)
    // *     example 1: $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
    // *     example 1: $array2 = {a: 'green', 0: 'yellow', 1: 'red'}
    // *     example 1: array_intersect_assoc($array1, $array2)
    // *     returns 1: {a: 'green'}


    var arr1 = arguments[0], retArr = {};
    var k1 = '', arr = {}, i = 0, k = '';

    arr1keys:
    for (k1 in arr1) {
        arrs:
        for (i=1; i < arguments.length; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (arr[k] === arr1[k1] && k === k1) {
                    if (i === arguments.length-1) {
                        retArr[k1] = arr1[k1];
                    }
                    // If the innermost loop always leads at least once to an equal value, continue the loop until done
                    continue arrs;
                }
            }
            // If it reaches here, it wasn't found in at least one array, so try next value
            continue arr1keys;
        }
    }

    return retArr;
}// }}}

// {{{ array_intersect_key
function array_intersect_key() {
    // Computes the intersection of arrays using keys for comparison
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_intersect_key/
    // +       version: 901.1301
    // +   original by: Brett Zamir
    // %        note 1: These only output associative arrays (would need to be
    // %        note 1: all numeric and counting from zero to be numeric)
    // *     example 1: $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
    // *     example 1: $array2 = {a: 'green', 0: 'yellow', 1: 'red'}
    // *     example 1: array_intersect_key($array1, $array2)
    // *     returns 1: {0: 'red', a: 'green'}

    var arr1 = arguments[0], retArr = {};
    var k1 = '', arr = {}, i = 0, k = '';

    arr1keys:
    for (k1 in arr1) {
        arrs:
        for (i=1; i < arguments.length; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (k === k1) {
                    if (i === arguments.length-1) {
                        retArr[k1] = arr1[k1];
                    }
                    // If the innermost loop always leads at least once to an equal value, continue the loop until done
                    continue arrs;
                }
            }
            // If it reaches here, it wasn't found in at least one array, so try next value
            continue arr1keys;
        }
    }

    return retArr;
}// }}}

// {{{ array_intersect_uassoc
function array_intersect_uassoc () {
    // Computes the intersection of arrays with additional index check, compares
    // indexes by a callback function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_intersect_uassoc/
    // +       version: 901.1411
    // +   original by: Brett Zamir
    // *     example 1: $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
    // *     example 1: $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
    // *     example 1: array_intersect_uassoc($array1, $array2, function(f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if(string1 > string2) return 1; if(string1 == string2) return 0; return -1;});
    // *     returns 1: {b: 'brown'}

    var arr1 = arguments[0], retArr = {}, cb = arguments[arguments.length-1];
    var k1 = '', i = 1, arr = {}, k = '';

    cb = (typeof cb === 'string') ? window[cb] : (cb instanceof Array) ? window[cb[0]][cb[1]] : cb;

    arr1keys:
    for (k1 in arr1) {
        arrs:
        for (i = 1; i < arguments.length-1; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (arr[k] === arr1[k1] && cb(k, k1) === 0 ) {
                    if (i === arguments.length-2) {
                        retArr[k1] = arr1[k1];
                    }
                    // If the innermost loop always leads at least once to an equal value, continue the loop until done
                    continue arrs;
                }
            }
            // If it reaches here, it wasn't found in at least one array, so try next value
            continue arr1keys;
        }
    }

    return retArr;
}// }}}

// {{{ array_intersect_ukey
function array_intersect_ukey  () {
    // Computes the intersection of arrays using a callback function on the keys for
    // comparison
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_intersect_ukey/
    // +       version: 901.1411
    // +   original by: Brett Zamir
    // *     example 1: $array1 = {blue: 1, red: 2, green: 3, purple: 4}
    // *     example 1: $array2 = {green: 5, blue: 6, yellow: 7, cyan: 8}
    // *     example 1: array_intersect_ukey ($array1, $array2, function(key1, key2){ return (key1 == key2 ? 0 : (key1 > key2 ? 1 : -1)); });
    // *     returns 1: {blue: 1, green: 3}

    var arr1 = arguments[0], retArr = {}, cb = arguments[arguments.length-1];
    var k1 = '', i = 1, arr = {}, k = '';

    cb = (typeof cb === 'string') ? window[cb] : (cb instanceof Array) ? window[cb[0]][cb[1]] : cb;

    arr1keys:
    for (k1 in arr1) {
        arrs:
        for (i = 1; i < arguments.length-1; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (cb(k, k1) === 0 ) {
                    if (i === arguments.length-2) {
                        retArr[k1] = arr1[k1];
                    }
                    // If the innermost loop always leads at least once to an equal value, continue the loop until done
                    continue arrs;
                }
            }
            // If it reaches here, it wasn't found in at least one array, so try next value
            continue arr1keys;
        }
    }

    return retArr;
    
}// }}}

// {{{ array_key_exists
function array_key_exists ( key, search ) {
    // Checks if the given key or index exists in the array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_key_exists/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Felix Geisendoerfer (http://www.debuggable.com/felix)
    // *     example 1: array_key_exists('kevin', {'kevin': 'van Zonneveld'});
    // *     returns 1: true

    // input sanitation
    if( !search || (search.constructor !== Array && search.constructor !== Object) ){
        return false;
    }

    return key in search;
}// }}}

// {{{ array_keys
function array_keys( input, search_value, strict ) {
    // Return all the keys of an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_keys/
    // +       version: 810.2018
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_keys( {firstname: 'Kevin', surname: 'van Zonneveld'} );
    // *     returns 1: {0: 'firstname', 1: 'surname'}
    
    var tmp_arr = {}, strict = !!strict, include = true, cnt = 0;
    
    for ( key in input ){
        include = true;
        if ( search_value != undefined ) {
            if( strict && input[key] !== search_value ){
                include = false;
            } else if( input[key] != search_value ){
                include = false;
            }
        }
        
        if( include ) {
            tmp_arr[cnt] = key;
            cnt++;
        }
    }
    
    return tmp_arr;
}// }}}

// {{{ array_map
function array_map( callback ) {
    // Applies the callback to the elements of the given arrays
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_map/
    // +       version: 811.1812
    // +   original by: Andrea Giammarchi (http://webreflection.blogspot.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // %        note 1: Takes a function as an argument, not a function's name
    // *     example 1: array_map( function(a){return (a * a * a)}, [1, 2, 3, 4, 5] );
    // *     returns 1: [ 1, 8, 27, 64, 125 ]

    var argc = arguments.length, argv = arguments;
    var j = argv[1].length, i = 0, k = 1, m = 0;
    var tmp = [], tmp_ar = [];

    while (i < j) {
        while (k < argc){
            tmp[m++] = argv[k++][i];
        }

        m = 0;
        k = 1;

        if( callback ){
            tmp_ar[i++] = callback.apply(null, tmp);
        } else{
            tmp_ar[i++] = tmp;
        }

        tmp = [];
    }

    return tmp_ar;
}// }}}

// {{{ array_merge
function array_merge() {
    // Merge one or more arrays
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_merge/
    // +       version: 811.2517
    // +   original by: Brett Zamir
    // +   bugfixed by: Nate
    // -    depends on: is_int
    // %          note: Relies on is_int because !isNaN accepts floats     
    // *     example 1: arr1 = {"color": "red", 0: 2, 1: 4}
    // *     example 1: arr2 = {0: "a", 1: "b", "color": "green", "shape": "trapezoid", 2: 4}
    // *     example 1: array_merge(arr1, arr2)
    // *     returns 1: {"color": "green", 0: 2, 1: 4, 2: "a", 3: "b", "shape": "trapezoid", 4: 4}
    // *     example 2: arr1 = []
    // *     example 2: arr2 = {1: "data"}
    // *     example 2: array_merge(arr1, arr2)
    // *     returns 2: {1: "data"}
    
    var args = Array.prototype.slice.call(arguments);
    var retObj = {}, k, j = 0, i = 0;
    var retArr;
    
    for (i=0, retArr=true; i < args.length; i++) {
        if (!(args[i] instanceof Array)) {
            retArr=false;
            break;
        }
    }
    
    if (retArr) {
        return args;
    }
    var ct = 0;
    
    for (i=0, ct=0; i < args.length; i++) {
        if (args[i] instanceof Array) {
            for (j=0; j < args[i].length; j++) {
                retObj[ct++] = args[i][j];
            }
        } else {
            for (k in args[i]) {
                if (is_int(k)) {
                    retObj[ct++] = args[i][k];
                } else {
                    retObj[k] = args[i][k];
                }
            }
        }
    }
    
    return retObj;
}// }}}

// {{{ array_merge_recursive
function array_merge_recursive (arr1, arr2){
    // Merge two or more arrays recursively
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_merge_recursive/
    // +       version: 812.114
    // +   original by: Subhasis Deb
    // -    depends on: array_merge
    // *     example 1: arr1 = {'color': {'favourite': 'read'}, 0: 5}
    // *     example 1: arr2 = {0: 10, 'color': {'favorite': 'green', 0: 'blue'}}
    // *     example 1: array_merge_recursive(arr1, arr2)
    // *     returns 1: {'color': {'favorite': {0: 'red', 1: 'green'}, 0: 'blue'}, 1: 5, 1: 10}

    if ((arr1 && (arr1 instanceof Array)) && (arr2 && (arr2 instanceof Array))) {
        for (var idx in arr2) {
            arr1.push(arr2[idx]);
        }
    } else if ((arr1 && (arr1 instanceof Object)) && (arr2 && (arr2 instanceof Object))) {
        for (var idx in arr2) {
            if (idx in arr1) {
                if (typeof arr1[idx] == 'object' && typeof arr2 == 'object') {
                    arr1[idx] = array_merge(arr1[idx], arr2[idx]);
                } else {
                    arr1[idx] = arr2[idx];
                }
            } else {
                arr1[idx] = arr2[idx];
            }
        }
    }
    
    return arr1;
}// }}}

// {{{ array_pad
function array_pad ( input, pad_size, pad_value ) {
    // Pad array to the specified length with a value
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_pad/
    // +       version: 811.1314
    // +   original by: Waldo Malqui Silva
    // *     example 1: array_pad([ 7, 8, 9 ], 2, 'a');
    // *     returns 1: [ 7, 8, 9]
    // *     example 2: array_pad([ 7, 8, 9 ], 5, 'a');
    // *     returns 2: [ 7, 8, 9, 'a', 'a']
    // *     example 3: array_pad([ 7, 8, 9 ], 5, 2);
    // *     returns 3: [ 7, 8, 9, 2, 2]
    // *     example 4: array_pad([ 7, 8, 9 ], -5, 'a');
    // *     returns 4: [ 'a', 'a', 7, 8, 9 ]

    var pad = [], newArray = [], newLength, i=0;

    if ( input instanceof Array && !isNaN ( pad_size ) ) {
        newLength = ( ( pad_size < 0 ) ? ( pad_size * -1 ) : pad_size );
        if ( newLength > input.length ) {
            for ( i = 0; i < ( newLength - input.length ); i++ ) { newArray [ i ] = pad_value; }
            pad = ( ( pad_size < 0 ) ? newArray.concat ( input ) : input.concat ( newArray ) );
        } else {
            pad = input;
        }
    }

    return pad;
}// }}}

// {{{ array_pop
function array_pop( array ) {
    // Pop the element off the end of array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_pop/
    // +       version: 902.210
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_pop([0,1,2]);
    // *     returns 1: 2
    // *     example 2: data = {firstName: 'Kevin', surName: 'van Zonneveld'};
    // *     example 2: lastElem = array_pop(data);
    // *     returns 2: 'van Zonneveld'
    // *     results 2: data == {firstName: 'Kevin'}

    var key = '', cnt = 0;

    if (array.hasOwnProperty('length')) {
        // Indexed
        if( !array.length ){
            // Done popping, are we?
            return null;
        }
        return array.pop();
    } else {
        // Associative
        for (key in array) {
            cnt++;
        }
        if (cnt) {
            return array[key];
            delete(array[key]);
        }
    }
}// }}}

// {{{ array_product
function array_product ( input ) {
    // Calculate the product of values in an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_product/
    // +       version: 811.1314
    // +   original by: Waldo Malqui Silva
    // *     example 1: array_product([ 2, 4, 6, 8 ]);
    // *     returns 1: 384

    var Index = 0, Product = 1;
    if ( input instanceof Array ) {
        while ( Index < input.length ) {
            Product *= ( !isNaN ( input [ Index ] ) ? input [ Index ] : 0 );
            Index++;
        }
    } else {
        Product = null;
    }

    return Product;
}// }}}

// {{{ array_push
function array_push ( array ) {
    // Push one or more elements onto the end of array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_push/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_push(['kevin','van'], 'zonneveld');
    // *     returns 1: 3

    var i, argv = arguments, argc = argv.length;

    for (i=1; i < argc; i++){
        array[array.length++] = argv[i];
    }

    return array.length;
}// }}}

// {{{ array_rand
function array_rand ( input, num_req ) {
    // Pick one or more random entries out of an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_rand/
    // +       version: 811.1314
    // +   original by: Waldo Malqui Silva
    // *     example 1: array_rand( ['Kevin'], 1 );
    // *     returns 1: 0

    var Indexes = [];
    var Ticks = num_req || 1;
    var checkDuplicate = function ( input, value ) {
        var Exist = false, Index = 0;
        while ( Index < input.length ) {
            if ( input [ Index ] === value ) {
                Exist = true;
                break;
            }
            Index++;
        }
        return Exist;
    };

    if ( input instanceof Array && Ticks <= input.length ) {
        while ( true ) {
            var Rand = Math.floor ( ( Math.random ( ) * input.length ) );
            if ( Indexes.length === Ticks ) { break; }
            if ( !checkDuplicate ( Indexes, Rand ) ) { Indexes.push ( Rand ); }
        }
    } else {
        Indexes = null;
    }

    return ( ( Ticks == 1 ) ? Indexes.join ( ) : Indexes );
}// }}}

// {{{ array_reduce
function array_reduce( a_input, callback ) {
    // Iteratively reduce the array to a single value using a callback function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_reduce/
    // +       version: 811.1812
    // +   original by: Alfonso Jimenez (http://www.alfonsojimenez.com)
    // %        note 1: Takes a function as an argument, not a function's name
    // *     example 1: array_reduce([1, 2, 3, 4, 5], function(v, w){v += w;return v;});
    // *     returns 1: 15
    
    var lon = a_input.length;
    var res = 0, i = 0;
    var tmp = new Array();

    
    for(i = 0; i < lon; i+=2 ) {
        tmp[0] = a_input[i];
        if(a_input[(i+1)]){
            tmp[1] = a_input[(i+1)];
        } else {
            tmp[1] = 0;
        }
        res+= callback.apply(null, tmp);
        tmp = new Array();
    }
    
    return res;
}// }}}

// {{{ array_reverse
function array_reverse(array, preserve_keys) {
    // Return an array with elements in reverse order
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_reverse/
    // +       version: 812.3017
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Karol Kowalski
    // *     example 1: array_reverse( [ 'php', '4.0', ['green', 'red'] ], true);
    // *     returns 1: { 2: ['green', 'red'], 1: 4, 0: 'php'}

    var arr_len = array.length, newkey = 0, tmp_arr = {}, key = '';
    preserve_keys = !!preserve_keys;
    
    for (key in array) {
        newkey = arr_len - key - 1;
        tmp_arr[preserve_keys ? key : newkey] = array[key];
    }

    return tmp_arr;
}// }}}

// {{{ array_search
function array_search( needle, haystack, strict ) {
    // Searches the array for a given value and returns the corresponding key if
    // successful
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_search/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_search('zonneveld', {firstname: 'kevin', middle: 'van', surname: 'zonneveld'});
    // *     returns 1: 'surname'

    var strict = !!strict;

    for(var key in haystack){
        if( (strict && haystack[key] === needle) || (!strict && haystack[key] == needle) ){
            return key;
        }
    }

    return false;
}// }}}

// {{{ array_shift
function array_shift( array ) {
    // Shift an element off the beginning of array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_shift/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Martijn Wieringa
    // *     example 1: array_shift(['Kevin', 'van', 'Zonneveld']);
    // *     returns 1: 'Kevin'

    if (array.length > 0) {
        return array.shift();
    }
    
    return null;
}// }}}

// {{{ array_slice
function array_slice(arr, offst, lgth, preserve_keys) {
    // Extract a slice of the array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_slice/
    // +       version: 812.1017
    // +   original by: Brett Zamir
    // -    depends on: is_int
    // %          note: Relies on is_int because !isNaN accepts floats 
    // *     example 1: array_slice(["a", "b", "c", "d", "e"], 2, -1);
    // *     returns 1: {0: 'c', 1: 'd'}
    // *     example 2: array_slice(["a", "b", "c", "d", "e"], 2, -1, true);
    // *     returns 2: {2: 'c', 3: 'd'}

    /*
    if ('callee' in arr && 'length' in arr) {
        arr = Array.prototype.slice.call(arr);
    }
    */

	if (!(arr instanceof Array) || (preserve_keys && offst != 0)) { // Assoc. array as input or if required as output
		var lgt =0, newAssoc = {};
		for (var key in arr) {
			//if (key !== 'length') {
				lgt += 1;
				newAssoc[key] = arr[key];
			//}
		}
		arr = newAssoc;
		
		offst = (offst < 0) ? lgt + offst : offst;
		lgth  = lgth == undefined ? lgt : (lgth < 0) ? lgt + lgth - offst : lgth;
		
		var assoc = {};
		var start = false, it=-1, arrlgth=0, no_pk_idx=0;
		for (var key in arr) {
		    ++it;
		    if (arrlgth >= lgth) {
		      break;
		    }
		    if (it == offst){
		      start = true;
		    }
		    if (!start) {
		       continue;
		    }
		    ++arrlgth;
		    if (is_int(key) && !preserve_keys) {
                assoc[no_pk_idx++] = arr[key];
		    } else {
		        assoc[key] = arr[key];
		    }
		}
		//assoc.length = arrlgth; // Make as array-like object (though length will not be dynamic)
		return assoc;
	}
    
    if (lgth === undefined) {
        return arr.slice(offst);    
    } else if (lgth >= 0) {
        return arr.slice(offst, offst + lgth);
    } else {
        return arr.slice(offst, lgth);
    }
    
}// }}}

// {{{ array_splice
function array_splice (arr, offst, lgth, replacement) {
    // Remove a portion of the array and replace it with something else
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_splice/
    // +       version: 812.1714
    // +   original by: Brett Zamir
    // %        note 1: Order does get shifted in associative array input with numeric indices,
    // %        note 1: since PHP behavior doesn't preserve keys, but I understand order is not reliable anyways
    // -    depends on: is_int
    // *     example 1: input = {4: "red", 'abc': "green", 2: "blue", 'dud': "yellow"};
    // *     example 1: array_splice(input, 2);
    // *     returns 1: {0: "blue", 'dud': "yellow"}
    // *     results 1: input == {'abc':"green", 0:"red"}
    // *     example 2: input = ["red", "green", "blue", "yellow"];
    // *     example 2: array_splice(input, 3, 0, "purple");
    // *     returns 2: []
    // *     results 2: input == ["red", "green", "blue", "purple", "yellow"]
    // *     example 3: input = ["red", "green", "blue", "yellow"]
    // *     example 3: array_splice(input, -1, 1, ["black", "maroon"]);
    // *     returns 3: ["yellow"]
    // *     results 3: input == ["red", "green", "blue", "black", "maroon"]
    
    var checkToUpIndices = function (arr, ct, key) {
        // Deal with situation, e.g., if encounter index 4 and try to set it to 0, but 0 exists later in loop (need to
        // increment all subsequent (skipping current key, since we need its value below) until find unused)
        if (arr[ct] !== undefined) {
            var tmp = ct;
            ct += 1;
            if (ct === key) {
                ct += 1;
            }
            ct = checkToUpIndices(arr, ct, key);
            arr[ct] = arr[tmp];
            delete arr[tmp];
        }
        return ct;
    }

    if (replacement && !(typeof replacement === 'object')) {
        replacement = [replacement];
    }
    if (lgth === undefined) {
        lgth = offst >= 0 ? arr.length - offst : -offst;
    } else if (lgth < 0) {
        lgth = (offst >= 0 ? arr.length - offst : -offst)  + lgth;
    }

    if (!(arr instanceof Array)) {
        /*if (arr.length !== undefined) { // Deal with array-like objects as input
        delete arr.length;
        }*/
        var lgt = 0, ct = -1, rmvd = [], rmvdObj = {}, repl_ct=-1, int_ct=-1;
        var returnArr = true, rmvd_ct = 0, rmvd_lgth = 0, key = '';
        // rmvdObj.length = 0;
        for (key in arr) { // Can do arr.__count__ in some browsers
            lgt += 1;
        }
        offst = (offst >= 0) ? offst : lgt + offst;
        for (key in arr) {
            ct += 1;
            if (ct < offst) {
                if (is_int(key)) {
                    int_ct += 1;
                    if (parseInt(key, 10) === int_ct) { // Key is already numbered ok, so don't need to change key for value
                        continue;
                    }
                    checkToUpIndices(arr, int_ct, key); // Deal with situation, e.g.,
                    // if encounter index 4 and try to set it to 0, but 0 exists later in loop
                    arr[int_ct] = arr[key];
                    delete arr[key];
                }
                continue;
            }
            if (returnArr && is_int(key)) {
                rmvd.push(arr[key]);
                rmvdObj[rmvd_ct++] = arr[key]; // PHP starts over here too
            } else {
                rmvdObj[key] = arr[key];
                returnArr    = false;
            }
            rmvd_lgth += 1;
            // rmvdObj.length += 1;

            if (replacement && replacement[++repl_ct]) {
                arr[key] = replacement[repl_ct]
            } else {
                delete arr[key];
            }
        }
        // arr.length = lgt - rmvd_lgth + (replacement ? replacement.length : 0); // Make (back) into an array-like object
        return returnArr ? rmvd : rmvdObj;
    }

    if (replacement) {
        replacement.unshift(offst, lgth);
        return Array.prototype.splice.apply(arr, replacement);
    }
    return arr.splice(offst, lgth);
}// }}}

// {{{ array_sum
function array_sum( array ) {
    // Calculate the sum of values in an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_sum/
    // +       version: 901.617
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Nate
    // +   bugfixed by: Gilbert
    // *     example 1: array_sum([4, 9, 182.6]);
    // *     returns 1: 195.6
    // *     example 2: total = []; index = 0.1; for(y=0; y < 12; y++){total[y] = y + index;}
    // *     example 2: array_sum(total);
    // *     returns 2: 67.2

    var key, sum = 0;
    
    // input sanitation
    if (typeof array !== 'object') {
        return null;
    }
    
    for (key in array) {
        //tester_print_r(typeof sum);
        sum += (array[key] * 1);
    }

    return sum;
}// }}}

// {{{ array_udiff
function array_udiff() {
    // Computes the difference of arrays by using a callback function for data
    // comparison
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_udiff/
    // +       version: 901.1411
    // +   original by: Brett Zamir
    // *     example 1: $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
    // *     example 1: $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
    // *     example 1: array_udiff($array1, $array2, function(f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if(string1 > string2) return 1; if(string1 == string2) return 0; return -1;});
    // *     returns 1: {c: 'blue'}


    var arr1 = arguments[0], retArr = {}, cb = arguments[arguments.length-1];
    var arr = '', i = 1, k1 = '', k = '';
    cb = (typeof cb === 'string') ? window[cb] : (cb instanceof Array) ? window[cb[0]][cb[1]] : cb;

    arr1keys:
    for (k1 in arr1) {
        for (i=1; i < arguments.length-1; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (cb(arr[k], arr1[k1]) === 0) {
                    // If it reaches here, it was found in at least one array, so try next value
                    continue arr1keys;
                }
            }
            retArr[k1] = arr1[k1];
        }
    }

    return retArr;
}// }}}

// {{{ array_udiff_assoc
function array_udiff_assoc() {
    // Computes the difference of arrays with additional index check, compares data by
    // a callback function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_udiff_assoc/
    // +       version: 901.1411
    // +   original by: Brett Zamir
    // *     example 1: array_udiff_assoc({0: 'kevin', 1: 'van', 2: 'Zonneveld'}, {0: 'Kevin', 4: 'van', 5: 'Zonneveld'}, function(f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if(string1 > string2) return 1; if(string1 == string2) return 0; return -1;});
    // *     returns 1: {1: 'van', 2: 'Zonneveld'}

    var arr1 = arguments[0], retArr = {}, cb = arguments[arguments.length-1];
    var arr = {}, i = 1, k1 = '', k = '';
    cb = (typeof cb === 'string') ? window[cb] : (cb instanceof Array) ? window[cb[0]][cb[1]] : cb;

    arr1keys:
    for (k1 in arr1) {
        for (i=1; i < arguments.length-1; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (cb(arr[k], arr1[k1]) === 0 && k === k1) {
                    // If it reaches here, it was found in at least one array, so try next value
                    continue arr1keys;
                }
            }
            retArr[k1] = arr1[k1];
        }
    }

    return retArr;
}// }}}

// {{{ array_udiff_uassoc
function array_udiff_uassoc () {
    // Computes the difference of arrays with additional index check, compares data and
    // indexes by a callback function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_udiff_uassoc/
    // +       version: 901.1415
    // +   original by: Brett Zamir
    // *     example 1: $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
    // *     example 1: $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
    // *     example 1: array_udiff_uassoc($array1, $array2, function(f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if(string1 > string2) return 1; if(string1 == string2) return 0; return -1;}, function(f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if(string1 > string2) return 1; if(string1 == string2) return 0; return -1;});
    // *     returns 1: {0: 'red', c: 'blue'}

    var arr1 = arguments[0], retArr = {}, cb = arguments[arguments.length-1], cb0 = arguments[arguments.length-2];
    var k1 = '', i = 1, k = '', arr = {};

    cb = (typeof cb === 'string') ? window[cb] : (cb instanceof Array) ? window[cb[0]][cb[1]] : cb;
    cb0 = (typeof cb0 === 'string') ? window[cb0] : (cb0 instanceof Array) ? window[cb0[0]][cb0[1]] : cb0;

    arr1keys:
    for (k1 in arr1) {
        for (i=1; i < arguments.length-2; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (cb0(arr[k], arr1[k1]) === 0 && cb(k, k1) === 0) {
                    // If it reaches here, it was found in at least one array, so try next value
                    continue arr1keys; 
                }
            }
            retArr[k1] = arr1[k1];
        }
    }

    return retArr;
}// }}}

// {{{ array_uintersect
function array_uintersect () {
    // Computes the intersection of arrays, compares data by a callback function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_uintersect/
    // +       version: 901.1301
    // +   original by: Brett Zamir
    // *     example 1: $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
    // *     example 1: $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
    // *     example 1: array_uintersect($array1, $array2, function(f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if(string1 > string2) return 1; if(string1 == string2) return 0; return -1;});
    // *     returns 1: {a: 'green', b: 'brown', 0: 'red'}

    var arr1 = arguments[0], retArr = {}, cb = arguments[arguments.length-1];
    var k1 = '', i = 1, arr = {}, k = '';

    cb = (typeof cb === 'string') ? window[cb] : (cb instanceof Array) ? window[cb[0]][cb[1]] : cb;

    arr1keys:  
    for (k1 in arr1) {
        arrs:
        for (i = 1; i < arguments.length-1; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (cb(arr[k], arr1[k1]) === 0 ) {
                    if (i === arguments.length-2) {
                        retArr[k1] = arr1[k1];
                    }
                    // If the innermost loop always leads at least once to an equal value, continue the loop until done
                    continue arrs;
                }
            }
            // If it reaches here, it wasn't found in at least one array, so try next value
            continue arr1keys;
        }
    }

    return retArr;
}// }}}

// {{{ array_uintersect_assoc
function array_uintersect_assoc () {
    // Computes the intersection of arrays with additional index check, compares data
    // by a callback function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_uintersect_assoc/
    // +       version: 901.1411
    // +   original by: Brett Zamir
    // *     example 1: $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
    // *     example 1: $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
    // *     example 1: array_uintersect_assoc($array1, $array2, function(f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if(string1 > string2) return 1; if(string1 == string2) return 0; return -1;});
    // *     returns 1: {a: 'green', b: 'brown'}

    var arr1 = arguments[0], retArr = {}, cb = arguments[arguments.length-1];
    var k1 = '', i = 1, arr = {}, k = '';

    cb = (typeof cb === 'string') ? window[cb] : (cb instanceof Array) ? window[cb[0]][cb[1]] : cb;

    arr1keys:
    for (k1 in arr1) {
        arrs:
        for (i = 1; i < arguments.length-1; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (cb(arr[k], arr1[k1]) === 0 && k === k1) {
                    if (i === arguments.length-2) {
                        retArr[k1] = arr1[k1];
                    }
                    // If the innermost loop always leads at least once to an equal value, continue the loop until done
                    continue arrs;
                }
            }
            // If it reaches here, it wasn't found in at least one array, so try next value
            continue arr1keys;
        }
    }

    return retArr;
}// }}}

// {{{ array_uintersect_uassoc
function array_uintersect_uassoc () {
    // Computes the intersection of arrays with additional index check, compares data
    // and indexes by a callback functions
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_uintersect_uassoc/
    // +       version: 901.1411
    // +   original by: Brett Zamir
    // *     example 1: $array1 = {a: 'green', b: 'brown', c: 'blue', 0: 'red'}
    // *     example 1: $array2 = {a: 'GREEN', B: 'brown', 0: 'yellow', 1: 'red'}
    // *     example 1: array_uintersect_uassoc($array1, $array2, function(f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if(string1 > string2) return 1; if(string1 == string2) return 0; return -1;}, function(f_string1, f_string2){var string1 = (f_string1+'').toLowerCase(); var string2 = (f_string2+'').toLowerCase(); if(string1 > string2) return 1; if(string1 == string2) return 0; return -1;});
    // *     returns 1: {a: 'green', b: 'brown'}

    var arr1 = arguments[0], retArr = {}, cb = arguments[arguments.length-1], cb0 = arguments[arguments.length-2];
    var k1 = '', i = 1, k = '', arr = {};

    cb = (typeof cb === 'string') ? window[cb] : (cb instanceof Array) ? window[cb[0]][cb[1]] : cb;
    cb0 = (typeof cb0 === 'string') ? window[cb0] : (cb0 instanceof Array) ? window[cb0[0]][cb0[1]] : cb0;

    arr1keys:
    for (k1 in arr1) {
        arrs:
        for (i = 1; i < arguments.length-2; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (cb0(arr[k], arr1[k1]) === 0 && cb(k, k1) === 0) {
                    if (i === arguments.length-3) {
                        retArr[k1] = arr1[k1];
                    }
                    continue arrs; // If the innermost loop always leads at least once to an equal value, continue the loop until done
                }
            }
            continue arr1keys; // If it reaches here, it wasn't found in at least one array, so try next value
        }
    }

    return retArr;
}// }}}

// {{{ array_unique
function array_unique( array ) {
    // Removes duplicate values from an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_unique/
    // +       version: 811.1314
    // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // +      input by: duncan
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Nate
    // *     example 1: array_unique(['Kevin','Kevin','van','Zonneveld','Kevin']);
    // *     returns 1: ['Kevin','van','Zonneveld']
    // *     example 2: array_unique({'a': 'green', 0: 'red', 'b': 'green', 1: 'blue', 2: 'red'});
    // *     returns 2: {'a': 'green', 0: 'red', 1: 'blue'}
    
    var key = '', tmp_arr1 = {}, tmp_arr2 = {};
    var val = '';
    tmp_arr1 = array;
    
	var __array_search = function (needle, haystack, strict) {
        var fkey = '';
	    var strict = !!strict;
	    for (fkey in haystack) {
	        if ((strict && haystack[fkey] === needle) || (!strict && haystack[fkey] == needle) ) {
	            return fkey;
	        }
	    }
	    return false;
	}    
	
    for (key in tmp_arr1) {
        val = tmp_arr1[key];
        if (false === __array_search(val, tmp_arr2)) {
            tmp_arr2[key] = val;
        }
        
        delete tmp_arr1[key];
    }
    
    return tmp_arr2;
}// }}}

// {{{ array_unshift
function array_unshift( array ) {
    // Prepend one or more elements to the beginning of an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_unshift/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Martijn Wieringa
    // *     example 1: array_unshift(['van', 'Zonneveld'], 'Kevin');
    // *     returns 1: 3

    var argc = arguments.length, argv = arguments, i;
    
    for (i = 1; i < argc; i++) {
        array.unshift(argv[i]);
    }
    
    return (array.length);
}// }}}

// {{{ array_values
function array_values( input ) {
    // Return all the values of an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_values/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: array_values( {firstname: 'Kevin', surname: 'van Zonneveld'} );
    // *     returns 1: {0: 'Kevin', 1: 'van Zonneveld'}

    var tmp_arr = new Array(), cnt = 0;

    for ( key in input ){
        tmp_arr[cnt] = input[key];
        cnt++;
    }

    return tmp_arr;
}// }}}

// {{{ array_walk
function array_walk (array, funcname, userdata) {
    // Apply a user function to every member of an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_walk/
    // +       version: 811.1812
    // +   original by: Johnny Mast (http://www.phpvrouwen.nl)
    // *     example 1: array_walk ({'a':'b'}, 'void', 'userdata');
    // *     returns 1: true
    // *     example 2: array_walk ('a', 'void', 'userdata');
    // *     returns 2: false
    
    var key; 
    
    if (typeof array != 'object') {
        return false;
    }
    
    for (key in array) {
        if (typeof (userdata) != 'undefined') {
            eval (funcname + '( array [key] , key , userdata  )' );
        } else {
            eval (funcname + '(  userdata ) ');
        }
    }
    
    return true;
}// }}}

// {{{ array_walk_recursive
function array_walk_recursive (array, funcname, userdata) {
    // Apply a user function recursively to every member of an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_array_walk_recursive/
    // +       version: 811.1812
    // +   original by: Johnny Mast (http://www.phpvrouwen.nl)
    // *     example 1: array_walk_recursive ({'a': 'b', 'c': {'d': 'e'}}, 'void', 'userdata');
    // *     returns 1: true
    // *     example 2: array_walk_recursive ('a', 'void', 'userdata');
    // *     returns 2: false
    
    var key;
    
    if (typeof array != 'object'){
        return false;
    }
 
    for (key in array) {            
        if (typeof array[key] == 'object') { 
            return array_walk_recursive (array [key], funcname, userdata);
        }
        
        if (typeof (userdata) != 'undefined') {
            eval (funcname + '( array [key] , key , userdata  )');
        } else {
            eval (funcname + '(  userdata ) ');
        }
    }
    
    return true;
}// }}}

// {{{ arsort
function arsort(inputArr, sort_flags) {
    // Sort an array in reverse order and maintain index association
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_arsort/
    // +       version: 901.2514
    // +   original by: Brett Zamir
    // +   improved by: Brett Zamir
    // %        note 1: SORT_STRING (as well as natsort and natcasesort) might also be
    // %        note 1: integrated into all of these functions by adapting the code at
    // %        note 1: http://sourcefrog.net/projects/natsort/natcompare.js
    // %        note 2: The examples are correct, this is a new way
    // %        note 2: Credits to: http://javascript.internet.com/math-related/bubble-sort.html
    // *     example 1: data = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'};
    // *     example 1: asort(data);
    // *     results 1: data == {c: 'apple', b: 'banana', d: 'lemon', a: 'orange'}
    // *     returns 1: true

    var valArr=[], keyArr=[], k, i, ret, sorter;

    switch (sort_flags) {
        case 'SORT_STRING': // compare items as strings
            sorter = function (a, b) {
                return strnatcmp(b, a);
            };
            break;
        case 'SORT_LOCALE_STRING': // compare items as strings, based on the current locale (set with i18n_loc_set_default() as of PHP6)
            sorter = function (a, b) {
                return(b.localeCompare(a));
            };
            break;
        case 'SORT_NUMERIC': // compare items numerically
            sorter = function (a, b) {
                return(a - b);
            };
            break;
        case 'SORT_REGULAR': // compare items normally (don't change types)
        default:
            sorter = function (a, b) {
                if (a > b)
                    return 1;
                if (a < b)
                    return -1;
                return 0;
            };
            break;
    }

    var bubbleSort = function(keyArr, inputArr) {
        var i, j, tempValue, tempKeyVal;
        for (i = inputArr.length-2; i >= 0; i--) {
            for (j = 0; j <= i; j++) {
                ret = sorter(inputArr[j+1], inputArr[j]);
                if (ret > 0) {
                    tempValue = inputArr[j];
                    inputArr[j] = inputArr[j+1];
                    inputArr[j+1] = tempValue;
                    tempKeyVal = keyArr[j];
                    keyArr[j] = keyArr[j+1];
                    keyArr[j+1] = tempKeyVal;
                }
            }
        }
    };

    // Get key and value arrays
    for (k in inputArr) {
        valArr.push(inputArr[k]);
        keyArr.push(k);
        delete inputArr[k] ;
    }
    try {
        // Sort our new temporary arrays
        bubbleSort(keyArr, valArr);
    } catch(e) {
        return false;
    }

    // Repopulate the old array
    for (i = 0; i < valArr.length; i++) {
        inputArr[keyArr[i]] = valArr[i];
    }

    return true;
}// }}}

// {{{ asort
function asort(inputArr, sort_flags) {
    // Sort an array and maintain index association
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_asort/
    // +       version: 901.2514
    // +   original by: Brett Zamir
    // +   improved by: Brett Zamir
    // %        note 1: SORT_STRING (as well as natsort and natcasesort) might also be
    // %        note 1: integrated into all of these functions by adapting the code at
    // %        note 1: http://sourcefrog.net/projects/natsort/natcompare.js
    // %        note 2: The examples are correct, this is a new way
    // %        note 2: Credits to: http://javascript.internet.com/math-related/bubble-sort.html
    // -    depends on: strnatcmp
    // *     example 1: data = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'};
    // *     example 1: asort(data);
    // *     results 1: data == {c: 'apple', b: 'banana', d: 'lemon', a: 'orange'}
    // *     returns 1: true

    var valArr=[], keyArr=[], k, i, ret, sorter;

    switch (sort_flags) {
        case 'SORT_STRING': // compare items as strings
            sorter = function (a, b) {
                return strnatcmp(a, b);
            };
            break;
        case 'SORT_LOCALE_STRING': // compare items as strings, based on the current locale (set with i18n_loc_set_default() as of PHP6)
            sorter = function (a, b) {
                return(a.localeCompare(b));
            };
            break;
        case 'SORT_NUMERIC': // compare items numerically
            sorter = function (a, b) {
                return(a - b);
            };
            break;
        case 'SORT_REGULAR': // compare items normally (don't change types)
        default:
            sorter = function (a, b) {
                if (a > b)
                    return 1;
                if (a < b)
                    return -1;
                return 0;
            };
            break;
    }

    var bubbleSort = function(keyArr, inputArr) {
        var i, j, tempValue, tempKeyVal;
        for (i = inputArr.length-2; i >= 0; i--) {
            for (j = 0; j <= i; j++) {
                ret = sorter(inputArr[j+1], inputArr[j]);
                if (ret < 0) {
                    tempValue = inputArr[j];
                    inputArr[j] = inputArr[j+1];
                    inputArr[j+1] = tempValue;
                    tempKeyVal = keyArr[j];
                    keyArr[j] = keyArr[j+1];
                    keyArr[j+1] = tempKeyVal;
                }
            }
        }
    };

    // Get key and value arrays
    for (k in inputArr) {
        valArr.push(inputArr[k]);
        keyArr.push(k);
        delete inputArr[k] ;
    }
    try {
        // Sort our new temporary arrays
        bubbleSort(keyArr, valArr);
    } catch(e) {
        return false;
    }

    // Repopulate the old array
    for (i = 0; i < valArr.length; i++) {
        inputArr[keyArr[i]] = valArr[i];
    }

    return true;
}// }}}

// {{{ chunk_split
function chunk_split(body, chunklen, end) {
    // Split a string into smaller chunks
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_chunk_split/
    // +       version: 812.115
    // +   original by: Paulo Ricardo F. Santos
    // *     example 1: chunk_split('Hello world!', 1, '*');
    // *     returns 1: 'H*e*l*l*o* *w*o*r*l*d*!*'
    // *     example 2: chunk_split('Hello world!', 10, '*');
    // *     returns 2: 'Hello worl*d!*'
    
    if (chunklen < 1) {
        return false;
    }

    var result = '', chunklen = chunklen || 76, end = end || '\r\n';

    while (body.length > chunklen) {
        result += body.substring(0, chunklen) + end;
        body = body.substring(chunklen);
    }

    return result + body + end;
}// }}}

// {{{ compact
function compact ( var_names ) {
    // Create array containing variables and their values
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_compact/
    // +       version: 811.1314
    // +   original by: Waldo Malqui Silva
    // +    tweaked by: Jack
    // *     example 1: var1 = 'Kevin'; var2 = 'van'; var3 = 'Zonneveld';  
    // *     example 1: compact('var1', 'var2', 'var3');
    // *     returns 1: {'var1': 'Kevin', 'var2': 'van', 'var3': 'Zonneveld'}    

    var Index = 0, Matrix = {};
    var process = function ( value ) {
        var i = 0, l = value.length, key_value = '';
        for (i = 0; i < l; i++ ) {
            var key_value = value [ i ];
            if ( key_value instanceof Array ) {
                process ( key_value );
            } else {
                if ( typeof window [ key_value ] !== 'undefined' ) {
                    Matrix [ key_value ] = window [ key_value ];
                }
            }
        }
        return true;
    };

    process ( arguments );
    return Matrix;
}// }}}

// {{{ count
function count( mixed_var, mode ) {
    // Count elements in an array, or properties in an object
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_count/
    // +       version: 811.1314
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Waldo Malqui Silva
    // *     example 1: count([[0,0],[0,-4]], 'COUNT_RECURSIVE');
    // *     returns 1: 6
    // *     example 2: count({'one' : [1,2,3,4,5]}, 'COUNT_RECURSIVE');
    // *     returns 2: 6

    var key, cnt = 0;

    if( mode == 'COUNT_RECURSIVE' ) mode = 1;
    if( mode != 1 ) mode = 0;

    for (key in mixed_var){
        cnt++;
        if( mode==1 && mixed_var[key] && (mixed_var[key].constructor === Array || mixed_var[key].constructor === Object) ){
            cnt += count(mixed_var[key], 1);
        }
    }

    return cnt;
}// }}}

// {{{ current
function current(arr) {
    // Return the current element in an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_current/
    // +       version: 901.617
    // +   original by: Brett Zamir
    // %        note 1: Uses global: window.php_js to store the array pointer
    // *     example 1: transport = ['foot', 'bike', 'car', 'plane'];
    // *     example 1: current(transport); 
    // *     returns 1: 'foot'

    if (!window.php_js) window.php_js = {
        pointers:[]
    };
    var pointers = window.php_js.pointers;
    if (pointers.indexOf(arr) === -1) {
        pointers.push(arr, 0);
    }
    var arrpos = pointers.indexOf(arr);
    var cursor = pointers[arrpos+1];
    if (arr instanceof Array) {
        return arr[cursor] || false;
    }
    var ct = 0;
    for (var k in arr) {
        if (ct === cursor) {
            return arr[k];
        }
        ct++;
    }
    return false; // Empty
}// }}}

// {{{ each
function each(arr) {
    // Return the current key and value pair from an array and advance the array cursor
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_each/
    // +       version: 901.617
    // +   original by: Ates Goral (http://magnetiq.com) 
    // +    revised by: Brett Zamir
    // %        note 1: Uses global: window.php_js to store the array pointer
    // *     example 1: each({a: "apple", b: "balloon"});
    // *     returns 1: {0: "a", 1: "apple", key: "a", value: "apple"}

    //  Will return a 4-item object unless a class property 'returnArrayOnly'
    //  is set to true on this function if want to only receive a two-item
    //  numerically-indexed array (for the sake of array destructuring in
    //  JavaScript 1.7+ (similar to list() in PHP, but as PHP does it automatically
    //  in that context and JavaScript cannot, we needed something to allow that option)
    //  See https://developer.mozilla.org/en/New_in_JavaScript_1.7#Destructuring_assignment
    
    if (!window.php_js) window.php_js = {
        pointers:[]
    };
    var pointers = window.php_js.pointers;
    if (pointers.indexOf(arr) === -1) {
        pointers.push(arr, 0);
    }
    var arrpos = pointers.indexOf(arr);
    var cursor = pointers[arrpos+1];
    if (!(arr instanceof Array)) {
        var ct = 0;
        for (var k in arr) {
            if (ct === cursor) {
                pointers[arrpos+1] += 1;
                if (each.returnArrayOnly) {
                    return [k, arr[k]];
                } else {
                    return {
                        1:arr[k],
                        value:arr[k],
                        0:k,
                        key:k
                    };
                }
            }
            ct++;
        }
        return false; // Empty
    }
    if (arr.length === 0 || cursor === arr.length) {
        return false;
    }
    pos = cursor;
    pointers[arrpos+1] += 1;
    if (each.returnArrayOnly) {
        return [pos, arr[pos]];
    } else {
        return {
            1:arr[pos],
            value:arr[pos],
            0:pos,
            key:pos
        };
    }
}// }}}

// {{{ end
function end ( arr ) {
    // Set the internal pointer of an array to its last element
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_end/
    // +       version: 901.617
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Legaev Andrey
    // +    revised by: J A R
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   restored by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Brett Zamir
    // %        note 1: Uses global: window.php_js to store the array pointer
    // *     example 1: end({0: 'Kevin', 1: 'van', 2: 'Zonneveld'});
    // *     returns 1: 'Zonneveld'
    // *     example 2: end(['Kevin', 'van', 'Zonneveld']);
    // *     returns 2: 'Zonneveld'
    
    if (!window.php_js) window.php_js = {
        pointers:[]
    };
    var pointers = window.php_js.pointers;
    if (pointers.indexOf(arr) === -1) {
        pointers.push(arr, 0);
    }
    var arrpos = pointers.indexOf(arr);
    if (!(arr instanceof Array)) {
        var ct = 0;
        for (var k in arr) {
            ct++;
            var val = arr[k];
        }
        if (ct === 0) {
            return false; // Empty
        }
        pointers[arrpos+1] = ct - 1;
        return val;
    }
    if (arr.length === 0) {
        return false;
    }
    pointers[arrpos+1] = arr.length - 1;
    return arr[pointers[arrpos+1]];
}// }}}

// {{{ extract
function extract (arr, type, prefix) {
    // Import variables into the current symbol table from an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_extract/
    // +       version: 901.714
    // +   original by: Brett Zamir
    // %        note 1: Only works by extracting into global context (whether called in the global scope or
    // %        note 1: within a function); also, the EXTR_REFS flag I believe can't be made to work
    // *     example 1: size = 'large';
    // *     example 1: var_array = {'color' : 'blue', 'size' : 'medium', 'shape' : 'sphere'};
    // *     example 1: extract(var_array, 'EXTR_PREFIX_SAME', 'wddx');
    // *     example 1: color+'-'+size+'-'+shape+'-'+wddx_size;
    // *     returns 1: 'blue-large-sphere-medium'

    if (arr instanceof Array && (type !== 'EXTR_PREFIX_ALL' && type !== 'EXTR_PREFIX_INVALID')) {
        return 0;
    }
    var chng = 0;

    for (var i in arr) {
        var validIdent = /^[_a-zA-Z$][\w|$]*$/; // TODO: Refine regexp to allow JS 1.5+ Unicode identifiers
        var prefixed = prefix+'_'+i;
        try {
            switch (type) {
                case 'EXTR_PREFIX_SAME' || 2:
                    if (this[i] !== undefined) {
                        if (prefixed.match(validIdent) != null) {
                            this[prefixed] = arr[i];
                            ++chng;
                        }
                    }
                    else {
                        this[i] = arr[i];
                        ++chng;
                    }
                    break;
                case 'EXTR_SKIP' || 1:
                    if (this[i] === undefined) {
                        this[i] = arr[i];
                        ++chng;
                    }
                    break;
                case 'EXTR_PREFIX_ALL' || 3:
                    if (prefixed.match(validIdent) != null) {
                        this[prefixed] = arr[i];
                        ++chng;
                    }
                    break;
                case 'EXTR_PREFIX_INVALID' || 4:
                    if(i.match(validIdent) != null) {
                        if (prefixed.match(validIdent) != null) {
                            this[prefixed] = arr[i];
                            ++chng;
                        }
                    }
                    else {
                        this[i] = arr[i];
                        ++chng;
                    }
                    break;
                case 'EXTR_IF_EXISTS' || 6:
                    if (this[i] !== undefined) {
                        this[i] = arr[i];
                        ++chng;
                    }
                    break;
                case 'EXTR_PREFIX_IF_EXISTS' || 5:
                    if (this[i] !== undefined && prefixed.match(validIdent) != null) {
                        this[prefixed] = arr[i];
                        ++chng;
                    }
                    break;
                case 'EXTR_REFS' || 256:
                    throw 'The EXTR_REFS type will not work in JavaScript';
                    break;
                case 'EXTR_OVERWRITE' || 0:
                // Fall-through
                default:
                    this[i] = arr[i];
                    ++chng;
                    break;
            }
        }
        catch (e) { // Just won't increment for problem assignments
            
        }
    }
    return chng;
}// }}}

// {{{ in_array
function in_array(needle, haystack, strict) {
    // Checks if a value exists in an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_in_array/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: in_array('van', ['Kevin', 'van', 'Zonneveld']);
    // *     returns 1: true

    var found = false, key, strict = !!strict;

    for (key in haystack) {
        if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
            found = true;
            break;
        }
    }

    return found;
}// }}}

// {{{ key
function key(arr) {
    // Fetch a key from an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_key/
    // +       version: 901.617
    // +   original by: Brett Zamir
    // %        note 1: Uses global: window.php_js to store the array pointer
    // *     example 1: array = {fruit1: 'apple', 'fruit2': 'orange'}
    // *     example 1: key(array);
    // *     returns 1: 'fruit1'

    if (!window.php_js) window.php_js = {
        pointers:[]
    };
    var pointers = window.php_js.pointers;
    if (pointers.indexOf(arr) === -1) {
        pointers.push(arr, 0);
    }
    var cursor = pointers[pointers.indexOf(arr)+1];
    if (!(arr instanceof Array)) {
        var ct = 0;
        for (var k in arr) {
            if (ct === cursor) {
                return k;
            }
            ct++;
        }
        return false; // Empty
    }
    if (arr.length === 0) {
        return false;
    }
    return cursor;
}// }}}

// {{{ krsort
function krsort(array, sort_flags) {
    // Sort an array by key in reverse order
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_krsort/
    // +       version: 901.2514
    // +   original by: GeekFG (http://geekfg.blogspot.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir
    // %          note: The examples are correct, this is a new way
    // *     example 1: data = {2: 'van', 3: 'Zonneveld', 1: 'Kevin'};
    // *     example 1: krsort(data);
    // *     results 1: data == {3: 'Kevin', 2: 'van', 1: 'Zonneveld'}
    // *     returns 1: true

    var tmp_arr={}, keys=[], sorter, i, key;

    switch (sort_flags) {
        case 'SORT_STRING': // compare items as strings
            sorter = function (a, b) {
                return strnatcmp(b, a);
            };
            break;
        case 'SORT_LOCALE_STRING': // compare items as strings, based on the current locale (set with  i18n_loc_set_default() as of PHP6)
            sorter = function (a, b) {
                return(b.localeCompare(a));
            };
            break;
        case 'SORT_NUMERIC': // compare items numerically
            sorter = function (a, b) {
                return(b - a);
            };
            break;
        case 'SORT_REGULAR': // compare items normally (don't change types)
        default:
            sorter = function (a, b) {
                if (a < b)
                    return 1;
                if (a > b)
                    return -1;
                return 0;
            };
            break;
    }

    // Make a list of key names
    for (key in array) {
        keys.push(key);
    }

    keys.sort(sorter);

    // Rebuild array with sorted key names
    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        tmp_arr[key] = array[key];
        delete array[key];
    }
    for (i in tmp_arr) {
        array[i] = tmp_arr[i]
    }

    return true;
}// }}}

// {{{ ksort
function ksort(array, sort_flags) {
    // Sort an array by key
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_ksort/
    // +       version: 901.2514
    // +   original by: GeekFG (http://geekfg.blogspot.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir
    // %          note: The examples are correct, this is a new way
    // *     example 1: data = {2: 'van', 3: 'Zonneveld', 1: 'Kevin'};
    // *     example 1: ksort(data);
    // *     results 1: data == {1: 'Kevin', 2: 'van', 3: 'Zonneveld'}
    // *     returns 1: true

    var tmp_arr={}, keys=[], sorter, i, key;

    switch (sort_flags) {
        case 'SORT_STRING': // compare items as strings
            sorter = function (a, b) {
                return strnatcmp(a, b);
            };
            break;
        case 'SORT_LOCALE_STRING': // compare items as strings, based on the current locale (set with  i18n_loc_set_default() as of PHP6)
            sorter = function (a, b) {
                return(a.localeCompare(b));
            };
            break;
        case 'SORT_NUMERIC': // compare items numerically
            sorter = function (a, b) {
                return(a - b);
            };
            break;
        case 'SORT_REGULAR': // compare items normally (don't change types)
        default:
            sorter = function (a, b) {
                if (a > b)
                    return 1;
                if (a < b)
                    return -1;
                return 0;
            };
            break;
    }

    // Make a list of key names
    for (key in array) {
        keys.push(key);
    }

    keys.sort(sorter);

    // Rebuild array with sorted key names
    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        tmp_arr[key] = array[key];
        delete array[key];
    }
    for (i in tmp_arr) {
        array[i] = tmp_arr[i]
    }

    return true;
}// }}}

// {{{ natcasesort
function natcasesort(inputArr) {
    // Sort an array using a case insensitive &quot;natural order&quot; algorithm
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_natcasesort/
    // +       version: 901.2514
    // +   original by: Brett Zamir
    // +   improved by: Brett Zamir
    // -    depends on: strnatcasecmp
    // *     example 1: $array1 = {0:'IMG0.png', 1:'img12.png', 2:'img10.png', 3:'img2.png', 4:'img1.png', 5:'IMG3.png'};
    // *     example 1: natcasesort($array1);
    // *     returns 1: {0: 'IMG0.png', 4: 'img1.png', 3: 'img2.png', 5: 'IMG3.png', 2: 'img10.png', 1: 'img12.png'}

    var valArr=[], keyArr=[], k, i, ret;

    var bubbleSort = function(keyArr, inputArr) {
        var i, j, tempValue, tempKeyVal;
        for (i = inputArr.length-2; i >= 0; i--) {
            for (j = 0; j <= i; j++) {
                ret = strnatcasecmp(inputArr[j+1], inputArr[j]);
                if (ret < 0) {
                    tempValue = inputArr[j];
                    inputArr[j] = inputArr[j+1];
                    inputArr[j+1] = tempValue;
                    tempKeyVal = keyArr[j];
                    keyArr[j] = keyArr[j+1];
                    keyArr[j+1] = tempKeyVal;
                }
            }
        }
    };

    // Get key and value arrays
    for (k in inputArr) {
        valArr.push(inputArr[k]);
        keyArr.push(k);
        delete inputArr[k] ;
    }
    try {
        // Sort our new temporary arrays
        bubbleSort(keyArr, valArr);
    } catch(e) {
        return false;
    }

    // Repopulate the old array
    for (i = 0; i < valArr.length; i++) {
        inputArr[keyArr[i]] = valArr[i];
    }

    return true;
}// }}}

// {{{ natsort
function natsort(inputArr) {
    // Sort an array using a &quot;natural order&quot; algorithm
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_natsort/
    // +       version: 901.2514
    // +   original by: Brett Zamir
    // +   improved by: Brett Zamir
    // -    depends on: strnatcmp
    // *     example 1: $array1 = {a:"img12.png", b:"img10.png", c:"img2.png", d:"img1.png"};
    // *     example 1: natcasesort($array1);
    // *     returns 1: {d: 'img1.png', c: 'img2.png', b: 'img10.png', a: 'img12.png'}

    var valArr=[], keyArr=[], k, i, ret;

    var bubbleSort = function(keyArr, inputArr) {
        var i, j, tempValue, tempKeyVal;
        for (i = inputArr.length-2; i >= 0; i--) {
            for (j = 0; j <= i; j++) {
                ret = strnatcmp(inputArr[j+1], inputArr[j]);
                if (ret < 0) {
                    tempValue = inputArr[j];
                    inputArr[j] = inputArr[j+1];
                    inputArr[j+1] = tempValue;
                    tempKeyVal = keyArr[j];
                    keyArr[j] = keyArr[j+1];
                    keyArr[j+1] = tempKeyVal;
                }
            }
        }
    };

    // Get key and value arrays
    for (k in inputArr) {
        valArr.push(inputArr[k]);
        keyArr.push(k);
        delete inputArr[k] ;
    }
    try {
        // Sort our new temporary arrays
        bubbleSort(keyArr, valArr);
    } catch(e) {
        return false;
    }

    // Repopulate the old array
    for (i = 0; i < valArr.length; i++) {
        inputArr[keyArr[i]] = valArr[i];
    }

    return true;
}// }}}

// {{{ next
function next (arr) {
    // Advance the internal array pointer of an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_next/
    // +       version: 901.617
    // +   original by: Brett Zamir
    // %        note 1: Uses global: window.php_js to store the array pointer
    // *     example 1: transport = ['foot', 'bike', 'car', 'plane'];
    // *     example 1: next(transport);
    // *     example 1: next(transport);
    // *     returns 1: 'car'

    if (!window.php_js) window.php_js = {
        pointers:[]
    };
    var pointers = window.php_js.pointers;
    if (pointers.indexOf(arr) === -1) {
        pointers.push(arr, 0);
    }
    var arrpos = pointers.indexOf(arr);
    var cursor = pointers[arrpos+1];
    if (!(arr instanceof Array)) {
        var ct = 0;
        for (var k in arr) {
            if (ct === cursor+1) {
                pointers[arrpos+1] += 1;
                return arr[k];
            }
            ct++;
        }
        return false; // End
    }
    if (arr.length === 0 || cursor === (arr.length-1)) {
        return false;
    }
    pointers[arrpos+1] += 1;
    return arr[pointers[arrpos+1]];
}// }}}

// {{{ pos
function pos(arr) {
    // Alias of current()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_pos/
    // +       version: 901.617
    // +   original by: Brett Zamir
    // %        note 1: Uses global: window.php_js to store the array pointer
    // -    depends on: current
    // *     example 1: transport = ['foot', 'bike', 'car', 'plane'];
    // *     example 1: pos(transport);
    // *     returns 1: 'foot'
    
    return current(arr);
}// }}}

// {{{ prev
function prev (arr) {
    // Rewind the internal array pointer
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_prev/
    // +       version: 901.617
    // +   original by: Brett Zamir
    // %        note 1: Uses global: window.php_js to store the array pointer
    // *     example 1: transport = ['foot', 'bike', 'car', 'plane'];
    // *     example 1: prev(transport);
    // *     returns 1: false

    if (!window.php_js) window.php_js = {
        pointers:[]
    };
    var pointers = window.php_js.pointers;
    var arrpos = pointers.indexOf(arr);
    var cursor = pointers[arrpos+1];
    if (pointers.indexOf(arr) === -1 || cursor === 0) {
        return false;
    }
    if (!(arr instanceof Array)) {
        var ct = 0;
        for (var k in arr) {
            if (ct === cursor-1) {
                pointers[arrpos+1] -= 1;
                return arr[k];
            }
            ct++;
        }
    // Shouldn't reach here
    }
    if (arr.length === 0) {
        return false;
    }
    pointers[arrpos+1] -= 1;
    return arr[pointers[arrpos+1]];
}// }}}

// {{{ range
function range ( low, high, step ) {
    // Create an array containing a range of elements
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_range/
    // +       version: 811.1314
    // +   original by: Waldo Malqui Silva
    // *     example 1: range ( 0, 12 );
    // *     returns 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    // *     example 2: range( 0, 100, 10 );
    // *     returns 2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    // *     example 3: range( 'a', 'i' );
    // *     returns 3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
    // *     example 4: range( 'c', 'a' );
    // *     returns 4: ['c', 'b', 'a']

    var matrix = [];
    var inival, endval, plus;
    var walker = step || 1;
    var chars  = false;

    if ( !isNaN ( low ) && !isNaN ( high ) ) {
        inival = low;
        endval = high;
    } else if ( isNaN ( low ) && isNaN ( high ) ) {
        chars = true;
        inival = low.charCodeAt ( 0 );
        endval = high.charCodeAt ( 0 );
    } else {
        inival = ( isNaN ( low ) ? 0 : low );
        endval = ( isNaN ( high ) ? 0 : high );
    }

    plus = ( ( inival > endval ) ? false : true );
    if ( plus ) {
        while ( inival <= endval ) {
            matrix.push ( ( ( chars ) ? String.fromCharCode ( inival ) : inival ) );
            inival += walker;
        }
    } else {
        while ( inival >= endval ) {
            matrix.push ( ( ( chars ) ? String.fromCharCode ( inival ) : inival ) );
            inival -= walker;
        }
    }

    return matrix;
}// }}}

// {{{ reset
function reset ( arr ) {
    // Set the internal pointer of an array to its first element
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_reset/
    // +       version: 901.617
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Legaev Andrey
    // +    revised by: Brett Zamir
    // %        note 1: Uses global: window.php_js to store the array pointer
    // *     example 1: reset({0: 'Kevin', 1: 'van', 2: 'Zonneveld'});
    // *     returns 1: 'Kevin' 
    
    if (!window.php_js) window.php_js = {
        pointers:[]
    };
    var pointers = window.php_js.pointers;
    if (pointers.indexOf(arr) === -1) {
        pointers.push(arr, 0);
    }
    var arrpos = pointers.indexOf(arr);
    if (!(arr instanceof Array)) {
        for (var k in arr) {
            if (pointers.indexOf(arr) === -1) {
                pointers.push(arr, 0);
            } else {
                pointers[arrpos+1] = 0;
            }
            return arr[k];
        }
        return false; // Empty
    }
    if (arr.length === 0) {
        return false;
    }
    pointers[arrpos+1] = 0;
    return arr[pointers[arrpos+1]];
}// }}}

// {{{ rsort
function rsort (inputArr, sort_flags) {
    // Sort an array in reverse order
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_rsort/
    // +       version: 901.2514
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Brett Zamir
    // +   improved by: Brett Zamir
    // %        note 1: SORT_STRING (as well as natsort and natcasesort) might also be
    // %        note 1: integrated into all of these functions by adapting the code at
    // %        note 1: http://sourcefrog.net/projects/natsort/natcompare.js
    // *     example 1: rsort(['Kevin', 'van', 'Zonneveld']);
    // *     returns 1: true
    // *     example 2: fruits = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'};
    // *     example 2: rsort(fruits);
    // *     returns 2: true
    // *     results 2: fruits == {0: 'orange', 1: 'lemon', 2: 'banana', 3: 'apple'}

    var valArr = [], keyArr=[];
    var k = '', i = 0, sorter = false;
    
    for (k in inputArr) { // Get key and value arrays
        valArr.push(inputArr[k]);
        delete inputArr[k] ;
    }

    switch (sort_flags) {
        case 'SORT_STRING': // compare items as strings
             sorter = function (a, b) {
                return strnatcmp(b, a);
            };
            break;
        case 'SORT_LOCALE_STRING': // compare items as strings, based on the current locale (set with  i18n_loc_set_default() as of PHP6)
            sorter = function (a, b) {
                return(b.localeCompare(a));
            };
            break;
        case 'SORT_NUMERIC': // compare items numerically
            sorter = function (a, b) {
                return(b - a);
            };
            break;
        case 'SORT_REGULAR': // compare items normally (don't change types)
        default:
            sorter = function (a, b) {
                if (a < b)
                    return 1;
                if (a > b)
                    return -1;
                return 0;
            };
            break;
    }
    valArr.sort(sorter);

    for (i = 0; i < valArr.length; i++) { // Repopulate the old array
        inputArr[i] = valArr[i];
    }
    return true;
}// }}}

// {{{ shuffle
function shuffle( inputArr ) {
    // Shuffle an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_shuffle/
    // +       version: 902.123
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Brett Zamir
    // *     example 1: shuffle({5:'a', 2:'3', 3:'c', 4:5, 'q':5});
    // *     returns 1: true

    var valArr = [];
    var k = '', i = 0;

    for (k in inputArr) { // Get key and value arrays
        valArr.push(inputArr[k]);
        delete inputArr[k] ;
    }
    valArr.sort(function() {return 0.5 - Math.random();});

    for (i = 0; i < valArr.length; i++) { // Repopulate the old array
        inputArr[i] = valArr[i];
    }
    
    return true;
}// }}}

// {{{ sizeof
function sizeof ( mixed_var, mode ) {
    // Alias of count()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_sizeof/
    // +       version: 809.522
    // +   original by: Philip Peterson
    // -    depends on: count
    // *     example 1: sizeof([[0,0],[0,-4]], 'COUNT_RECURSIVE');
    // *     returns 1: 6
    // *     example 2: sizeof({'one' : [1,2,3,4,5]}, 'COUNT_RECURSIVE');
    // *     returns 2: 6
 
    return count( mixed_var, mode );
}// }}}

// {{{ sort
function sort (inputArr, sort_flags) {
    // Sort an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_sort/
    // +       version: 901.2514
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Brett Zamir
    // +   improved by: Brett Zamir
    // %        note 1: SORT_STRING (as well as natsort and natcasesort) might also be
    // %        note 1: integrated into all of these functions by adapting the code at
    // %        note 1: http://sourcefrog.net/projects/natsort/natcompare.js
    // *     example 1: sort(['Kevin', 'van', 'Zonneveld']);
    // *     returns 1: true
    // *     example 2: fruits = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'};
    // *     example 2: sort(fruits);
    // *     returns 2: true
    // *     results 2: fruits == {0: 'apple', 1: 'banana', 2: 'lemon', 3: 'orange'}

    var valArr = [], keyArr=[];
    var k = '', i = 0, sorter = false;
    
    for (k in inputArr) { // Get key and value arrays
        valArr.push(inputArr[k]);
        delete inputArr[k] ;
    }

    switch (sort_flags) {
        case 'SORT_STRING': // compare items as strings
            sorter = function (a, b) {
                return strnatcmp(a, b);
            };
            break;
        case 'SORT_LOCALE_STRING': // compare items as strings, based on the current locale (set with  i18n_loc_set_default() as of PHP6)
            sorter = function (a, b) {
                return(a.localeCompare(b));
            };
            break;
        case 'SORT_NUMERIC': // compare items numerically
            sorter = function (a, b) {
                return(a - b);
            };
            break;
        case 'SORT_REGULAR': // compare items normally (don't change types)
        default:
            sorter = function (a, b) {
                if (a > b)
                    return 1;
                if (a < b)
                    return -1;
                return 0;
            };
            break;
    }
    valArr.sort(sorter);

    for (i = 0; i < valArr.length; i++) { // Repopulate the old array
        inputArr[i] = valArr[i];
    }
    return true;
}// }}}

// {{{ uasort
function uasort (inputArr, sorter) {
    // Sort an array with a user-defined comparison function and maintain index
    // association
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_uasort/
    // +       version: 901.1714
    // +   original by: Brett Zamir
    // +   improved by: Brett Zamir
    // *     example 1: fruits = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'};
    // *     example 1: uasort(fruits, function (a, b) { if (a > b) {return 1;}if (a < b) {return -1;} return 0;});
    // *     results 1: fruits == {c: 'apple', b: 'banana', d: 'lemon', a: 'orange'}

    if (typeof sorter === 'string') {
        sorter = this[sorter];
    } else if (sorter instanceof Array) {
        sorter = this[sorter[0]][sorter[1]];
    }
    
    var valArr = [], keyArr=[], tempKeyVal, tempValue, ret;
    var k = '', i = 0;

    var sorterNew = function (keyArr, valArr) {
        for (var i=valArr.length-2; i >=0; i--) {
            for (var j=0; j <= i; j++) {
                ret = sorter(valArr[j+1], valArr[j]);
                if (ret < 0) {
                    tempValue = valArr[j];
                    valArr[j] = valArr[j+1];
                    valArr[j+1] = tempValue;
                    tempKeyVal = keyArr[j];
                    keyArr[j] = keyArr[j+1];
                    keyArr[j+1] = tempKeyVal;
                }
            }
        }
    }

    for (k in inputArr) { // Get key and value arrays
        valArr.push(inputArr[k]);
        keyArr.push(k);
        delete inputArr[k] ;
    }
    try {
        sorterNew(keyArr, valArr); // Sort our new temporary arrays
    } catch(e) {
        return false;
    }
    for (i = 0; i < valArr.length; i++) { // Repopulate the old array
        inputArr[keyArr[i]] = valArr[i];
    }
    
    return true;
}// }}}

// {{{ uksort
function uksort(array, sorter) {
    // Sort an array by keys using a user-defined comparison function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_uksort/
    // +       version: 901.1411
    // +   original by: Brett Zamir
    // %          note: The examples are correct, this is a new way
    // *     example 1: data = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'};
    // *     example 1: uksort(data, function(key1, key2){ return (key1 == key2 ? 0 : (key1 > key2 ? 1 : -1)); });
    // *     results 1: data == {a: 'orange', b: 'banana', c: 'apple', d: 'lemon'}
    // *     returns 1: true

    if (typeof sorter === 'string') {
        sorter = window[sorter];
    }

    var tmp_arr = {}, keys = [], i = 0, key = '';

    // Make a list of key names
    for (key in array) {
        keys.push(key);
    }

    // Sort key names
    try {
        if (sorter) {
            keys.sort(sorter);
        } else {
            keys.sort();
        }
    } catch (e) {
        return false;
    }

    // Rebuild array with sorted key names
    for (i = 0; i < keys.length; i++) {
        key = keys[i];
        tmp_arr[key] = array[key];
        delete array[key];
    }
    for (i in tmp_arr) {
        array[i] = tmp_arr[i]
    }
    return true;
}// }}}

// {{{ usort
function usort (inputArr, sorter) {
    // Sort an array by values using a user-defined comparison function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_usort/
    // +       version: 901.1623
    // +   original by: Brett Zamir
    // *     example 1: stuff = {d: '3', a: '1', b: '11', c: '4'};
    // *     example 1: usort(stuff, function (a, b) {return(a-b);});
    // *     results 1: stuff = {0: '1', 1: '3', 2: '4', 3: '11'};

    var valArr = [], keyArr=[];
    var k = '', i = 0;

    if (typeof sorter === 'string') {
        sorter = this[sorter];
    } else if (sorter instanceof Array) {
        sorter = this[sorter[0]][sorter[1]];
    }
    for (k in inputArr) { // Get key and value arrays
        valArr.push(inputArr[k]);
        delete inputArr[k] ;
    }
    try {
        valArr.sort(sorter);
    } catch (e) {
        return false;
    }
    for (i = 0; i < valArr.length; i++) { // Repopulate the old array
        inputArr[i] = valArr[i];
    }

    return true;
}// }}}

// {{{ class_exists
function class_exists (cls) {
    // Checks if the class has been defined
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_class_exists/
    // +       version: 902.1022
    // +   original by: Brett Zamir
    // *     example 1: function class_a() {this.meth1 = function() {return true;}};
    // *     example 1: var instance_a = new class_a();
    // *     example 1: class_exists('class_a');
    // *     returns 1: true

    var i = '';
    cls = window[cls]; // Note: will prevent inner classes

    if (typeof cls !== 'function') {return false;}

    for (i in cls.prototype) {
        return true;
    }
    for (i in cls) { // If static members exist, then consider a "class"
        if (i !== 'prototype') {
            return true;
        }
    }
    if (cls.toSource && cls.toSource().match(/this\./)) { 
        // Hackish and non-standard but can probably detect if setting
        // a property (we don't want to test by instantiating as that
        // may have side-effects)
        return true;
    }
    
    return false;
}// }}}

// {{{ get_class
function get_class(obj) {
    // Returns the name of the class of an object
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_get_class/
    // +       version: 809.522
    // +   original by: Ates Goral (http://magnetiq.com)
    // +   improved by: David James
    // *     example 1: get_class(new (function MyClass() {}));
    // *     returns 1: "MyClass"
    // *     example 2: get_class({});
    // *     returns 2: "Object"
    // *     example 3: get_class([]);
    // *     returns 3: false
    // *     example 4: get_class(42);
    // *     returns 4: false
    // *     example 5: get_class(window);
    // *     returns 5: false
    // *     example 6: get_class(function MyFunction() {});
    // *     returns 6: false

    if (obj instanceof Object && !(obj instanceof Array) 
        && !(obj instanceof Function) && obj.constructor
        && obj != window) {
        var arr = obj.constructor.toString().match(/function\s*(\w+)/);

        if (arr && arr.length == 2) {
            return arr[1];
        }
    }

    return false;
}// }}}

// {{{ get_class_methods
function get_class_methods (name) {
    // Gets the class methods&#039; names
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_get_class_methods/
    // +       version: 902.123
    // +   original by: Brett Zamir
    // *     example 1: function Myclass () {this.privMethod = function(){}}
    // *     example 1: Myclass.classMethod = function () {}
    // *     example 1: Myclass.prototype.myfunc1 = function () {return(true);};
    // *     example 1: Myclass.prototype.myfunc2 = function () {return(true);}
    // *     example 1: get_class_methods('MyClass')
    // *     returns 1: {}

    var constructor, retArr={}, method = '';

    if (typeof name === 'function') {
        constructor = name;
    } else if (typeof name === 'string') {
        constructor = window[name];
    } else if (typeof name === 'object') {
        constructor = name;
        for (method in constructor.constructor) { // Get class methods of object's constructor
            if (typeof constructor.constructor[method] === 'function') {
                retArr[method] = constructor.constructor[method];
            }
        }
        // return retArr; // Uncomment to behave as "class" is usually defined in JavaScript convention (and see comment below)
    }
    for (method in constructor) {
        if (typeof constructor[method] === 'function') {
            retArr[method] = constructor[method];
        }
    }
     // Comment out this block to behave as "class" is usually defined in JavaScript convention (and see comment above)
    for (method in constructor.prototype) {
        if (typeof constructor.prototype[method] === 'function') {
            retArr[method] = constructor.prototype[method];
        }
    }
    
    return retArr;
}// }}}

// {{{ get_class_vars
function get_class_vars (name) {
    // Get the default properties of the class
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_get_class_vars/
    // +       version: 902.123
    // +   original by: Brett Zamir
    // *     example 1: function Myclass(){privMethod = function(){};}
    // *     example 1: Myclass.classMethod = function () {}
    // *     example 1: Myclass.prototype.myfunc1 = function () {return(true);};
    // *     example 1: Myclass.prototype.myfunc2 = function () {return(true);}
    // *     example 1: get_class_vars('MyClass')
    // *     returns 1: {}

    
    var constructor, retArr={}, prop = '';
    
    if (typeof name === 'function') {
        constructor = name;
    } else if (typeof name === 'string') {
        constructor = window[name];
    }
    
    for (prop in constructor) {
        if (typeof constructor[prop] !== 'function' && prop !== 'prototype') {
            retArr[prop] = constructor[prop];
        }
    }
     // Comment out this block to behave as "class" is usually defined in JavaScript convention
    if (constructor.prototype) {
        for (prop in constructor.prototype) {
            if (typeof constructor.prototype[prop] !== 'function') {
                retArr[prop] = constructor.prototype[prop];
            }
        }
    }
    
    return retArr;
}// }}}

// {{{ get_declared_classes
function get_declared_classes() {
    // Returns an array with the name of the defined classes
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_get_declared_classes/
    // +       version: 902.1022
    // +   original by: Brett Zamir
    // +    depends on: class_exists
    // *     example 1: function A (z) {this.z=z} // Assign 'this' in constructor, making it class-like
    // *     example 1: function B () {}
    // *     example 1: B.c = function () {}; // Add a static method, making it class-like
    // *     example 1: function C () {}
    // *     example 1: C.prototype.z = function () {}; // Add to prototype, making it behave as a "class"
    // *     example 1: get_declared_classes()
    // *     returns 1: [C, B, A]

    var i = '', arr = [], already = {};
    var j = '';

    for (i in window) {
        try {
            if (typeof window[i] === 'function') {
                if (!already[i] && class_exists(i)) {
                    already[i] = 1;
                    arr.push(i);
                }
            } else if (typeof window[i] === 'object') {
                for (j in window[i]) {
                    if (typeof window[j] === 'function' && window[j] && !already[j] && class_exists(j)) {
                        already[j] = 1;
                        arr.push(j);
                    }
                }
            }
        } catch (e) {

        }
    }

    return arr;
}// }}}

// {{{ get_object_vars
function get_object_vars (obj) {
    // Gets the properties of the given object
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_get_object_vars/
    // +       version: 902.123
    // +   original by: Brett Zamir
    // *     example 1: function Myclass () {this.privMethod = function(){}}
    // *     example 1: Myclass.classMethod = function () {}
    // *     example 1: Myclass.prototype.myfunc1 = function () {return(true);};
    // *     example 1: Myclass.prototype.myfunc2 = function () {return(true);}
    // *     example 1: get_object_vars('MyClass')
    // *     returns 1: {}

    var retArr = {}, prop = '';

    for (prop in obj) {
        if (typeof obj[prop] !== 'function' && prop !== 'prototype') {
            retArr[prop] = obj[prop];
        }
    }
    for (prop in obj.prototype) {
        if (typeof obj.prototype[prop] !== 'function') {
            retArr[prop] = obj.prototype[prop];
        }
    }
    
    return retArr;
}// }}}

// {{{ method_exists
function method_exists (obj, method) {
    // Checks if the class method exists
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_method_exists/
    // +       version: 812.3015
    // +   original by: Brett Zamir
    // *     example 1: function class_a() {this.meth1 = function() {return true;}};
    // *     example 1: var instance_a = new class_a();
    // *     example 1: method_exists(instance_a, 'meth1');
    // *     returns 1: true
    // *     example 2: function class_a() {this.meth1 = function() {return true;}};
    // *     example 2: var instance_a = new class_a();
    // *     example 2: method_exists(instance_a, 'meth2');
    // *     returns 2: false

    if (typeof obj === 'string') {
        return window[obj] && typeof window[obj][method] === 'function'
    }

    return typeof obj[method] === 'function';
}// }}}

// {{{ property_exists
function property_exists (cls, prop) {
    // Checks if the object or class has a property
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_property_exists/
    // +       version: 812.3015
    // +   original by: Brett Zamir
    // *     example 1: function class_a() {this.prop1 = 'one'};
    // *     example 1: var instance_a = new class_a();
    // *     example 1: property_exists(instance_a, 'prop1');
    // *     returns 1: true
    // *     example 2: function class_a() {this.prop1 = 'one'};
    // *     example 2: var instance_a = new class_a();
    // *     example 2: property_exists(instance_a, 'prop2');
    // *     returns 2: false

    cls = (typeof cls === 'string') ? window[cls] : cls;
    
    if (typeof cls === 'function' && cls.toSource &&
        cls.toSource().match(new RegExp('this\\.'+prop+'\\s'))
    ) {
        // Hackish and non-standard but can probably detect if setting
        // the property (we don't want to test by instantiating as that
        // may have side-effects)
        return true;
    }

    return (cls[prop] !== undefined && typeof cls[prop] !== 'function')
        || (cls.prototype !== undefined && cls.prototype[prop] !== undefined && typeof cls.prototype[prop] !== 'function')
        || (cls.constructor && cls.constructor[prop] !== undefined && typeof cls.constructor[prop] !== 'function');
}// }}}

// {{{ checkdate
function checkdate( month, day, year ) {
    // Validate a Gregorian date
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_checkdate/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Pyerre
    // *     example 1: checkdate(12, 31, 2000);
    // *     returns 1: true
    // *     example 2: checkdate(2, 29, 2001);
    // *     returns 2: false
    // *     example 3: checkdate(03, 31, 2008);
    // *     returns 3: true
    // *     example 4: checkdate(1, 390, 2000);
    // *     returns 4: false

    var myDate = new Date();
    myDate.setFullYear( year, (month - 1), day );

    return ((myDate.getMonth()+1) == month && day<32); 
}// }}}

// {{{ date
function date ( format, timestamp ) {
    // Format a local time/date
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_date/
    // +       version: 901.1301
    // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // +      parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: MeEtc (http://yass.meetcweb.com)
    // +   improved by: Brad Touesnard
    // +   improved by: Tim Wiel
    // +   improved by: Bryan Elliott
    // +   improved by: Brett Zamir
    // +   improved by: David Randall
    // *     example 1: date('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400);
    // *     returns 1: '09:09:40 m is month'
    // *     example 2: date('F j, Y, g:i a', 1062462400);
    // *     returns 2: 'September 2, 2003, 2:26 am'
    // *     example 3: date('Y W o', 1062462400);
    // *     returns 3: '2003 36 2003'
    // *     example 4: x = date('Y m d', (new Date()).getTime()/1000); // 2009 01 09
    // *     example 4: (x+'').length == 10
    // *     returns 4: true

    var a, jsdate=(
        (typeof(timestamp) == 'undefined') ? new Date() : // Not provided
        (typeof(timestamp) == 'number') ? new Date(timestamp*1000) : // UNIX timestamp
        new Date(timestamp) // Javascript Date()
    );
    var pad = function(n, c){
        if( (n = n + "").length < c ) {
            return new Array(++c - n.length).join("0") + n;
        } else {
            return n;
        }
    };
    var txt_weekdays = ["Sunday","Monday","Tuesday","Wednesday",
        "Thursday","Friday","Saturday"];
    var txt_ordin = {1:"st",2:"nd",3:"rd",21:"st",22:"nd",23:"rd",31:"st"};
    var txt_months =  ["", "January", "February", "March", "April",
        "May", "June", "July", "August", "September", "October", "November",
        "December"];

    var f = {
        // Day
            d: function(){
                return pad(f.j(), 2);
            },
            D: function(){
                var t = f.l();
                return t.substr(0,3);
            },
            j: function(){
                return jsdate.getDate();
            },
            l: function(){
                return txt_weekdays[f.w()];
            },
            N: function(){
                return f.w() + 1;
            },
            S: function(){
                return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th';
            },
            w: function(){
                return jsdate.getDay();
            },
            z: function(){
                return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0;
            },

        // Week
            W: function(){
                var a = f.z(), b = 364 + f.L() - a;
                var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;

                if(b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b){
                    return 1;
                } else{

                    if(a <= 2 && nd >= 4 && a >= (6 - nd)){
                        nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
                        return date("W", Math.round(nd2.getTime()/1000));
                    } else{
                        return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
                    }
                }
            },

        // Month
            F: function(){
                return txt_months[f.n()];
            },
            m: function(){
                return pad(f.n(), 2);
            },
            M: function(){
                t = f.F(); return t.substr(0,3);
            },
            n: function(){
                return jsdate.getMonth() + 1;
            },
            t: function(){
                var n;
                if( (n = jsdate.getMonth() + 1) == 2 ){
                    return 28 + f.L();
                } else{
                    if( n & 1 && n < 8 || !(n & 1) && n > 7 ){
                        return 31;
                    } else{
                        return 30;
                    }
                }
            },

        // Year
            L: function(){
                var y = f.Y();
                return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0;
            },
            o: function(){
                if (f.n() === 12 && f.W() === 1) {
                    return jsdate.getFullYear()+1;
                }
                if (f.n() === 1 && f.W() >= 52) {
                    return jsdate.getFullYear()-1;
                }
                return jsdate.getFullYear();
            },
            Y: function(){
                return jsdate.getFullYear();
            },
            y: function(){
                return (jsdate.getFullYear() + "").slice(2);
            },

        // Time
            a: function(){
                return jsdate.getHours() > 11 ? "pm" : "am";
            },
            A: function(){
                return f.a().toUpperCase();
            },
            B: function(){
                // peter paul koch:
                var off = (jsdate.getTimezoneOffset() + 60)*60;
                var theSeconds = (jsdate.getHours() * 3600) +
                                 (jsdate.getMinutes() * 60) +
                                  jsdate.getSeconds() + off;
                var beat = Math.floor(theSeconds/86.4);
                if (beat > 1000) beat -= 1000;
                if (beat < 0) beat += 1000;
                if ((String(beat)).length == 1) beat = "00"+beat;
                if ((String(beat)).length == 2) beat = "0"+beat;
                return beat;
            },
            g: function(){
                return jsdate.getHours() % 12 || 12;
            },
            G: function(){
                return jsdate.getHours();
            },
            h: function(){
                return pad(f.g(), 2);
            },
            H: function(){
                return pad(jsdate.getHours(), 2);
            },
            i: function(){
                return pad(jsdate.getMinutes(), 2);
            },
            s: function(){
                return pad(jsdate.getSeconds(), 2);
            },
            u: function(){
                return pad(jsdate.getMilliseconds()*1000, 6);
            },

        // Timezone
            //e not supported yet
            I: function(){
                var DST = (new Date(jsdate.getFullYear(),6,1,0,0,0));
                DST = DST.getHours()-DST.getUTCHours();
                var ref = jsdate.getHours()-jsdate.getUTCHours();
                return ref != DST ? 1 : 0;
            },
            O: function(){
               var t = pad(Math.abs(jsdate.getTimezoneOffset()/60*100), 4);
               if (jsdate.getTimezoneOffset() > 0) t = "-" + t; else t = "+" + t;
               return t;
            },
            P: function(){
                var O = f.O();
                return (O.substr(0, 3) + ":" + O.substr(3, 2));
            },
            //T not supported yet
            Z: function(){
               var t = -jsdate.getTimezoneOffset()*60;
               return t;
            },

        // Full Date/Time
            c: function(){
                return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P();
            },
            r: function(){
                return f.D()+', '+f.d()+' '+f.M()+' '+f.Y()+' '+f.H()+':'+f.i()+':'+f.s()+' '+f.O();
            },
            U: function(){
                return Math.round(jsdate.getTime()/1000);
            }
    };

    return format.replace(/[\\]?([a-zA-Z])/g, function(t, s){
        if( t!=s ){
            // escaped
            ret = s;
        } else if( f[s] ){
            // a date function exists
            ret = f[s]();
        } else{
            // nothing special
            ret = s;
        }

        return ret;
    });
}// }}}

// {{{ getdate
function getdate(timestamp) {
    // Get date/time information
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_getdate/
    // +       version: 812.313
    // +   original by: Paulo Ricardo F. Santos
    // *     example 1: getdate(1055901520);
    // *     returns 1: {'seconds': 40, 'minutes': 58, 'hours': 21, 'mday': 17, 'wday': 2, 'mon': 6, 'year': 2003, 'yday': 167, 'weekday': 'Tuesday', 'month': 'June', '0': 1055901520}

    var _w = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var _m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var d = (typeof timestamp == 'number') ? new Date(timestamp * 1000) : new Date();
    var w = d.getDay();
    var m = d.getMonth();
    var y = d.getFullYear();
    var r = {};

    r['seconds'] = d.getSeconds();
    r['minutes'] = d.getMinutes();
    r['hours'] = d.getHours();
    r['mday'] = d.getDate();
    r['wday'] = w;
    r['mon'] = m + 1;
    r['year'] = y;
    r['yday'] = Math.floor((d - (new Date(y, 0, 1))) / 86400000);
    r['weekday'] = _w[w];
    r['month'] = _m[m];
    r['0'] = parseInt(d.getTime() / 1000);

    return r;
}// }}}

// {{{ microtime
function microtime(get_as_float) {
    // Return current Unix timestamp with microseconds
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_microtime/
    // +       version: 812.313
    // +   original by: Paulo Ricardo F. Santos
    // *     example 1: timeStamp = microtime(true);
    // *     results 1: timeStamp > 1000000000 && timeStamp < 2000000000

    var now = new Date().getTime() / 1000;
    var s = parseInt(now);

    return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
}// }}}

// {{{ mktime
function mktime() {
    // Get Unix timestamp for a date
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_mktime/
    // +       version: 901.2514
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: baris ozdil
    // +      input by: gabriel paderni 
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: FGFEmperor
    // +      input by: Yannoo
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: jakes
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Marc Palau
    // *     example 1: mktime(14, 10, 2, 2, 1, 2008);
    // *     returns 1: 1201871402
    // *     example 2: mktime(0, 0, 0, 0, 1, 2008);
    // *     returns 2: 1196463600
    // *     example 3: make = mktime();
    // *     example 3: td = new Date();
    // *     example 3: real = Math.floor(td.getTime()/1000);
    // *     example 3: diff = (real - make);
    // *     results 3: diff < 5
    // *     example 4: mktime(0, 0, 0, 13, 1, 1997)
    // *     returns 4: 883609200
    // *     example 5: mktime(0, 0, 0, 1, 1, 1998)
    // *     returns 5: 883609200
    // *     example 6: mktime(0, 0, 0, 1, 1, 98)
    // *     returns 6: 883609200
    
    var no, ma = 0, mb = 0, i = 0, d = new Date(), argv = arguments, argc = argv.length;

    if (argc > 0){
        d.setHours(0,0,0); d.setDate(1); d.setMonth(1); d.setYear(1972);
    }
 
    var dateManip = {
        0: function(tt){ return d.setHours(tt); },
        1: function(tt){ return d.setMinutes(tt); },
        2: function(tt){ var set = d.setSeconds(tt); mb = d.getDate() - 1; return set; },
        3: function(tt){ var set = d.setMonth(parseInt(tt)-1); ma = d.getFullYear() - 1972; return set; },
        4: function(tt){ return d.setDate(tt+mb); },
        5: function(tt){ return d.setYear(tt+ma); }
    };
    
    for( i = 0; i < argc; i++ ){
        no = parseInt(argv[i]*1);
        if (isNaN(no)) {
            return false;
        } else {
            // arg is number, let's manipulate date object
            if(!dateManip[i](no)){
                // failed
                return false;
            }
        }
    }

    return Math.floor(d.getTime()/1000);
}// }}}

// {{{ strtotime
function strtotime(str, now) {
    // Parse about any English textual datetime description into a Unix timestamp
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strtotime/
    // +       version: 902.1612
    // +   original by: Caio Ariede (http://caioariede.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: David
    // %        note 1: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
    // *     example 1: strtotime('+1 day', 1129633200);
    // *     returns 1: 1129719600
    // *     example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
    // *     returns 2: 1130425202
    // *     example 3: strtotime('last month', 1129633200);
    // *     returns 3: 1127041200
    // *     example 4: strtotime('2009-05-04 08:30:00');
    // *     returns 4: 1241418600

    var i, match, s, strTmp = '', parse = '';

    strTmp = str;
    strTmp = strTmp.replace(/\s{2,}|^\s|\s$/g, ' '); // unecessary spaces
    strTmp = strTmp.replace(/[\t\r\n]/g, ''); // unecessary chars

    if (strTmp == 'now') {
        return (new Date()).getTime();
    } else if (!isNaN(parse = Date.parse(strTmp))) {
        return parse/1000;
    } else if (now) {
        now = new Date(now);
    } else {
        now = new Date();
    }

    strTmp = strTmp.toLowerCase();

    var process = function (m) {
        var ago = (m[2] && m[2] == 'ago');
        var num = (num = m[0] == 'last' ? -1 : 1) * (ago ? -1 : 1);

        switch (m[0]) {
            case 'last':
            case 'next':
                switch (m[1].substring(0, 3)) {
                    case 'yea':
                        now.setFullYear(now.getFullYear() + num);
                        break;
                    case 'mon':
                        now.setMonth(now.getMonth() + num);
                        break;
                    case 'wee':
                        now.setDate(now.getDate() + (num * 7));
                        break;
                    case 'day':
                        now.setDate(now.getDate() + num);
                        break;
                    case 'hou':
                        now.setHours(now.getHours() + num);
                        break;
                    case 'min':
                        now.setMinutes(now.getMinutes() + num);
                        break;
                    case 'sec':
                        now.setSeconds(now.getSeconds() + num);
                        break;
                    default:
                        var day;
                        if (typeof (day = __is_day[m[1].substring(0, 3)]) != 'undefined') {
                            var diff = day - now.getDay();
                            if (diff == 0) {
                                diff = 7 * num;
                            } else if (diff > 0) {
                                if (m[0] == 'last') diff -= 7;
                            } else {
                                if (m[0] == 'next') diff += 7;
                            }

                            now.setDate(now.getDate() + diff);
                        }
                }

                break;

            default:
                if (/\d+/.test(m[0])) {
                    num *= parseInt(m[0]);

                    switch (m[1].substring(0, 3)) {
                        case 'yea':
                            now.setFullYear(now.getFullYear() + num);
                            break;
                        case 'mon':
                            now.setMonth(now.getMonth() + num);
                            break;
                        case 'wee':
                            now.setDate(now.getDate() + (num * 7));
                            break;
                        case 'day':
                            now.setDate(now.getDate() + num);
                            break;
                        case 'hou':
                            now.setHours(now.getHours() + num);
                            break;
                        case 'min':
                            now.setMinutes(now.getMinutes() + num);
                            break;
                        case 'sec':
                            now.setSeconds(now.getSeconds() + num);
                            break;
                    }
                } else {
                    return false;
                }

                break;
        }

        return true;
    }
    
    var __is =
    {
        day:
        {
            'sun': 0,
            'mon': 1,
            'tue': 2,
            'wed': 3,
            'thu': 4, 
            'fri': 5,
            'sat': 6
        },
        mon:
        {
            'jan': 0,
            'feb': 1,
            'mar': 2,
            'may': 3,
            'apr': 4,
            'jun': 5,
            'jul': 6,
            'aug': 7,
            'sep': 8,
            'oct': 9,
            'nov': 10,
            'dec': 11
        }
    }

    match = strTmp.match(/^(\d{2,4}-\d{2}-\d{2})(\s\d{1,2}:\d{1,2}(:\d{1,2})?)?$/);

    if (match != null) {
        if (!match[2]) {
            match[2] = '00:00:00';
        } else if (!match[3]) {
            match[2] += ':00';
        }

        s = match[1].split(/-/g);

        for (i in __is.mon) {
            if (__is.mon[i] == s[1] - 1) {
                s[1] = i;
            }
        }

        return strtotime(s[2] + ' ' + s[1] + ' ' + s[0] + ' ' + match[2]);
    }
 
    var regex = '([+-]?\\d+\\s'
    + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?'
    + '|sun\.?|sunday|mon\.?|monday|tue\.?|tuesday|wed\.?|wednesday'
    + '|thu\.?|thursday|fri\.?|friday|sat\.?|saturday)'
    + '|(last|next)\\s'
    + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?'
    + '|sun\.?|sunday|mon\.?|monday|tue\.?|tuesday|wed\.?|wednesday'
    + '|thu\.?|thursday|fri\.?|friday|sat\.?|saturday))'
    + '(\\sago)?';

    match = strTmp.match(new RegExp(regex, 'g'));

    if (match == null) {
        return false;
    }

    for (i in match) {
        if (!process(match[i].split(' '))) {
            return false;
        }
    }

    return (now);
}// }}}

// {{{ time
function time() {
    // Return current Unix timestamp
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_time/
    // +       version: 809.522
    // +   original by: GeekFG (http://geekfg.blogspot.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: metjay
    // *     example 1: timeStamp = time();
    // *     results 1: timeStamp > 1000000000 && timeStamp < 2000000000
    
    return Math.round(new Date().getTime()/1000);
}// }}}

// {{{ timezone_abbreviations_list
function timezone_abbreviations_list() {
    // Alias of  DateTimeZone::listAbbreviations
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_timezone_abbreviations_list/
    // +       version: 902.1612
    // +   original by: Brett Zamir
    // +      input by: ChaosNo1
    // %        note 1: Based on list returned by PHP 5.2.6 (Windows)
    // %        note 2: We build the timezones as a private static variable (and then return
    // %        note 2: a function which returns this variable) to avoid recreating the object
    // %        note 2: upon each call to this function
    // *     example 1: list = timezone_abbreviations_list();
    // *     results 1: list.acst[0].timezone_id == 'America/Porto_Acre'
    // *     returns 1: true

    var timezone_abbreviations = {
      'acst' :
      [
        {'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Porto_Acre'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Eirunepe'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Rio_Branco'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'Brazil/Acre'
        }
      ],
      'act' :
      [
        {'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Porto_Acre'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Eirunepe'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Rio_Branco'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'Brazil/Acre'
        }
      ],
      'addt' :
      [
        {'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Goose_Bay'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Pangnirtung'
        }
      ],
      'adt' :
      [
        {'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Halifax'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Barbados'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Blanc-Sablon'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Glace_Bay'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Goose_Bay'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Martinique'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Moncton'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Pangnirtung'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Thule'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'Atlantic/Bermuda'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'Canada/Atlantic'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Asia/Baghdad'
        }
      ],
      'aft' :
      [
        {'dst' : false,
          'offset' : 16200,
          'timezone_id' : 'Asia/Kabul'
        }
      ],
      'ahdt' :
      [
        {'dst' : true,
          'offset' : -32400,
          'timezone_id' : 'America/Anchorage'
        },{
          'dst' : true,
          'offset' : -32400,
          'timezone_id' : 'US/Alaska'
        }
      ],
      'ahst' :
      [
        {'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'America/Anchorage'
        },{
          'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'America/Adak'
        },{
          'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'America/Atka'
        },{
          'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'US/Alaska'
        },{
          'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'US/Aleutian'
        }
      ],
      'akdt' :
      [
        {'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Anchorage'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Juneau'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Nome'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Yakutat'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'US/Alaska'
        }
      ],
      'akst' :
      [
        {'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'America/Anchorage'
        },{
          'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'America/Juneau'
        },{
          'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'America/Nome'
        },{
          'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'America/Yakutat'
        },{
          'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'US/Alaska'
        }
      ],
      'aktst' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Aqtobe'
        }
      ],
      'aktt' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Aqtobe'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Aqtobe'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Aqtobe'
        }
      ],
      'almst' :
      [
        {'dst' : true,
          'offset' : 25200,
          'timezone_id' : 'Asia/Almaty'
        }
      ],
      'almt' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Almaty'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Almaty'
        }
      ],
      'amst' :
      [
        {'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Asia/Yerevan'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Yerevan'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Boa_Vista'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Campo_Grande'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Cuiaba'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Manaus'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Porto_Velho'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'Brazil/West'
        }
      ],
      'amt' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Yerevan'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Yerevan'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Boa_Vista'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Campo_Grande'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Cuiaba'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Manaus'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Porto_Velho'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'Brazil/West'
        },{
          'dst' : false,
          'offset' : 1172,
          'timezone_id' : 'Europe/Amsterdam'
        }
      ],
      'anast' :
      [
        {'dst' : true,
          'offset' : 43200,
          'timezone_id' : 'Asia/Anadyr'
        },{
          'dst' : true,
          'offset' : 46800,
          'timezone_id' : 'Asia/Anadyr'
        },{
          'dst' : true,
          'offset' : 50400,
          'timezone_id' : 'Asia/Anadyr'
        }
      ],
      'anat' :
      [
        {'dst' : false,
          'offset' : 39600,
          'timezone_id' : 'Asia/Anadyr'
        },{
          'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'Asia/Anadyr'
        },{
          'dst' : false,
          'offset' : 46800,
          'timezone_id' : 'Asia/Anadyr'
        }
      ],
      'ant' :
      [
        {'dst' : false,
          'offset' : -16200,
          'timezone_id' : 'America/Curacao'
        },{
          'dst' : false,
          'offset' : -16200,
          'timezone_id' : 'America/Aruba'
        }
      ],
      'apt' :
      [
        {'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Halifax'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Blanc-Sablon'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Glace_Bay'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Moncton'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Pangnirtung'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Puerto_Rico'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'Canada/Atlantic'
        }
      ],
      'aqtst' :
      [
        {'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Aqtau'
        },{
          'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Aqtau'
        },{
          'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Aqtobe'
        }
      ],
      'aqtt' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Aqtau'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Aqtau'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Aqtobe'
        }
      ],
      'arst' :
      [
        {'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Buenos_Aires'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Buenos_Aires'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Buenos_Aires'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Catamarca'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/ComodRivadavia'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Cordoba'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Jujuy'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/La_Rioja'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Mendoza'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Rio_Gallegos'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/San_Juan'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Tucuman'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Ushuaia'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Catamarca'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Cordoba'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Jujuy'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Mendoza'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Rosario'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'Antarctica/Palmer'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Argentina/Buenos_Aires'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Argentina/Catamarca'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Argentina/ComodRivadavia'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Argentina/Cordoba'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Argentina/Jujuy'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Argentina/La_Rioja'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Argentina/Mendoza'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Argentina/Rio_Gallegos'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Argentina/San_Juan'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Argentina/Tucuman'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Argentina/Ushuaia'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Catamarca'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Cordoba'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Jujuy'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Mendoza'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Rosario'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'Antarctica/Palmer'
        }
      ],
      'art' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Buenos_Aires'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Buenos_Aires'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Buenos_Aires'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Catamarca'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/ComodRivadavia'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Cordoba'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Jujuy'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/La_Rioja'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Mendoza'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Rio_Gallegos'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/San_Juan'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Tucuman'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Ushuaia'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Catamarca'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Cordoba'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Jujuy'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Mendoza'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Rosario'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'Antarctica/Palmer'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Buenos_Aires'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Catamarca'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/ComodRivadavia'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Cordoba'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Jujuy'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/La_Rioja'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Mendoza'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Rio_Gallegos'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/San_Juan'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Tucuman'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Ushuaia'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Catamarca'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Cordoba'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Jujuy'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Mendoza'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Rosario'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'Antarctica/Palmer'
        }
      ],
      'ashst' :
      [
        {'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Ashkhabad'
        },{
          'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Ashkhabad'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Ashgabat'
        },{
          'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Ashgabat'
        }
      ],
      'asht' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Ashkhabad'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Ashkhabad'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Ashgabat'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Ashgabat'
        }
      ],
      'ast' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Riyadh'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Anguilla'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Antigua'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Aruba'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Barbados'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Blanc-Sablon'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Curacao'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Dominica'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Glace_Bay'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Goose_Bay'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Grenada'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Guadeloupe'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Halifax'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Martinique'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Miquelon'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Moncton'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Montserrat'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Pangnirtung'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Port_of_Spain'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Puerto_Rico'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Santo_Domingo'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/St_Kitts'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/St_Lucia'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/St_Thomas'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/St_Vincent'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Thule'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Tortola'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Virgin'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'Atlantic/Bermuda'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'Canada/Atlantic'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Aden'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Baghdad'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Bahrain'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Kuwait'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Qatar'
        }
      ],
      'awt' :
      [
        {'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Halifax'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Blanc-Sablon'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Glace_Bay'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Moncton'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Pangnirtung'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Puerto_Rico'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'Canada/Atlantic'
        }
      ],
      'azomt' :
      [
        {'dst' : true,
          'offset' : 0,
          'timezone_id' : 'Atlantic/Azores'
        }
      ],
      'azost' :
      [
        {'dst' : true,
          'offset' : -3600,
          'timezone_id' : 'Atlantic/Azores'
        },{
          'dst' : true,
          'offset' : 0,
          'timezone_id' : 'Atlantic/Azores'
        }
      ],
      'azot' :
      [
        {'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Atlantic/Azores'
        },{
          'dst' : false,
          'offset' : -7200,
          'timezone_id' : 'Atlantic/Azores'
        }
      ],
      'azst' :
      [
        {'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Asia/Baku'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Baku'
        }
      ],
      'azt' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Baku'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Baku'
        }
      ],
      'bakst' :
      [
        {'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Asia/Baku'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Baku'
        }
      ],
      'bakt' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Baku'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Baku'
        }
      ],
      'bdst' :
      [
        {'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/London'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Belfast'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Gibraltar'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Guernsey'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Isle_of_Man'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Jersey'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'GB'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'GB-Eire'
        }
      ],
      'bdt' :
      [
        {'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'America/Adak'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'America/Atka'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'America/Nome'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'US/Aleutian'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Dacca'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Dhaka'
        }
      ],
      'beat' :
      [
        {'dst' : false,
          'offset' : 9000,
          'timezone_id' : 'Africa/Mogadishu'
        },{
          'dst' : false,
          'offset' : 9000,
          'timezone_id' : 'Africa/Kampala'
        },{
          'dst' : false,
          'offset' : 9000,
          'timezone_id' : 'Africa/Nairobi'
        }
      ],
      'beaut' :
      [
        {'dst' : false,
          'offset' : 9885,
          'timezone_id' : 'Africa/Nairobi'
        },{
          'dst' : false,
          'offset' : 9885,
          'timezone_id' : 'Africa/Dar_es_Salaam'
        },{
          'dst' : false,
          'offset' : 9885,
          'timezone_id' : 'Africa/Kampala'
        }
      ],
      'bmt' :
      [
        {'dst' : false,
          'offset' : -14308,
          'timezone_id' : 'America/Barbados'
        },{
          'dst' : false,
          'offset' : -3996,
          'timezone_id' : 'Africa/Banjul'
        },{
          'dst' : false,
          'offset' : 6264,
          'timezone_id' : 'Europe/Tiraspol'
        },{
          'dst' : false,
          'offset' : 6264,
          'timezone_id' : 'Europe/Chisinau'
        }
      ],
      'bnt' :
      [
        {'dst' : false,
          'offset' : 27000,
          'timezone_id' : 'Asia/Brunei'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Brunei'
        }
      ],
      'bortst' :
      [
        {'dst' : true,
          'offset' : 30000,
          'timezone_id' : 'Asia/Kuching'
        }
      ],
      'bort' :
      [
        {'dst' : false,
          'offset' : 27000,
          'timezone_id' : 'Asia/Kuching'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Kuching'
        }
      ],
      'bost' :
      [
        {'dst' : true,
          'offset' : -12756,
          'timezone_id' : 'America/La_Paz'
        }
      ],
      'bot' :
      [
        {'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/La_Paz'
        }
      ],
      'brst' :
      [
        {'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Sao_Paulo'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Araguaina'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Bahia'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Belem'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Fortaleza'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Maceio'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Recife'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'Brazil/East'
        }
      ],
      'brt' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Sao_Paulo'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Araguaina'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Bahia'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Belem'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Fortaleza'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Maceio'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Recife'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'Brazil/East'
        }
      ],
      'bst' :
      [
        {'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/London'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/London'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'America/Adak'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'America/Atka'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'America/Nome'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Midway'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Pago_Pago'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Samoa'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'US/Aleutian'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'US/Samoa'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Belfast'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Guernsey'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Isle_of_Man'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Jersey'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'GB'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'GB-Eire'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Eire'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Belfast'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Dublin'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Gibraltar'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Guernsey'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Isle_of_Man'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Jersey'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'GB'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'GB-Eire'
        }
      ],
      'btt' :
      [
        {'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Thimbu'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Thimphu'
        }
      ],
      'burt' :
      [
        {'dst' : false,
          'offset' : 23400,
          'timezone_id' : 'Asia/Calcutta'
        },{
          'dst' : false,
          'offset' : 23400,
          'timezone_id' : 'Asia/Dacca'
        },{
          'dst' : false,
          'offset' : 23400,
          'timezone_id' : 'Asia/Dhaka'
        },{
          'dst' : false,
          'offset' : 23400,
          'timezone_id' : 'Asia/Rangoon'
        }
      ],
      'cant' :
      [
        {'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Atlantic/Canary'
        }
      ],
      'capt' :
      [
        {'dst' : true,
          'offset' : -32400,
          'timezone_id' : 'America/Anchorage'
        },{
          'dst' : true,
          'offset' : -32400,
          'timezone_id' : 'US/Alaska'
        }
      ],
      'cast' :
      [
        {'dst' : false,
          'offset' : 34200,
          'timezone_id' : 'Australia/Adelaide'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Africa/Gaborone'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Africa/Khartoum'
        }
      ],
      'cat' :
      [
        {'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'America/Anchorage'
        },{
          'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'US/Alaska'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Khartoum'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Blantyre'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Gaborone'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Harare'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Kigali'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Lusaka'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Maputo'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Windhoek'
        }
      ],
      'cawt' :
      [
        {'dst' : true,
          'offset' : -32400,
          'timezone_id' : 'America/Anchorage'
        },{
          'dst' : true,
          'offset' : -32400,
          'timezone_id' : 'US/Alaska'
        }
      ],
      'cddt' :
      [
        {'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Rankin_Inlet'
        }
      ],
      'cdt' :
      [
        {'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Chicago'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Havana'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'Cuba'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Atikokan'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Belize'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Cambridge_Bay'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Cancun'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Chihuahua'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Coral_Harbour'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Costa_Rica'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/El_Salvador'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Fort_Wayne'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Guatemala'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Indianapolis'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Knox'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Marengo'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Petersburg'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Vevay'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Vincennes'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Winamac'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indianapolis'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Iqaluit'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Kentucky/Louisville'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Kentucky/Monticello'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Knox_IN'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Louisville'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Managua'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Menominee'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Merida'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Mexico_City'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Monterrey'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/North_Dakota/Center'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/North_Dakota/New_Salem'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Pangnirtung'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Rainy_River'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Rankin_Inlet'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Tegucigalpa'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Winnipeg'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'Canada/Central'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'CST6CDT'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'Mexico/General'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'US/Central'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'US/East-Indiana'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'US/Indiana-Starke'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Shanghai'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Chongqing'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Chungking'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Harbin'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Kashgar'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Taipei'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Urumqi'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'PRC'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'ROC'
        }
      ],
      'cemt' :
      [
        {'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Berlin'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'CET'
        }
      ],
      'cest' :
      [
        {'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Berlin'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Kaliningrad'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Africa/Algiers'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Africa/Ceuta'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Africa/Tripoli'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Africa/Tunis'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Arctic/Longyearbyen'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Atlantic/Jan_Mayen'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'CET'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Amsterdam'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Andorra'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Athens'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Belgrade'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Bratislava'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Brussels'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Budapest'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Chisinau'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Copenhagen'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Gibraltar'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Kaliningrad'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Kiev'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Lisbon'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Ljubljana'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Luxembourg'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Madrid'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Malta'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Minsk'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Monaco'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Oslo'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Paris'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Podgorica'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Prague'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Riga'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Rome'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/San_Marino'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Sarajevo'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Simferopol'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Skopje'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Sofia'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Stockholm'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Tallinn'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Tirane'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Tiraspol'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Uzhgorod'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Vaduz'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Vatican'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Vienna'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Vilnius'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Warsaw'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Zagreb'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Zaporozhye'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Zurich'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Libya'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Poland'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Portugal'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'WET'
        }
      ],
      'cet' :
      [
        {'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Berlin'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Algiers'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Casablanca'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Ceuta'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Tripoli'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Tunis'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Arctic/Longyearbyen'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Atlantic/Jan_Mayen'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'CET'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Amsterdam'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Andorra'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Athens'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Belgrade'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Bratislava'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Brussels'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Budapest'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Chisinau'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Copenhagen'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Gibraltar'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Kaliningrad'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Kiev'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Lisbon'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Ljubljana'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Luxembourg'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Madrid'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Malta'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Minsk'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Monaco'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Oslo'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Paris'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Podgorica'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Prague'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Riga'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Rome'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/San_Marino'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Sarajevo'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Simferopol'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Skopje'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Sofia'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Stockholm'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Tallinn'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Tirane'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Tiraspol'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Uzhgorod'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Vaduz'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Vatican'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Vienna'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Vilnius'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Warsaw'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Zagreb'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Zaporozhye'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Zurich'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Libya'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Poland'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Portugal'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'WET'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Kaliningrad'
        }
      ],
      'cgst' :
      [
        {'dst' : true,
          'offset' : -3600,
          'timezone_id' : 'America/Scoresbysund'
        }
      ],
      'cgt' :
      [
        {'dst' : false,
          'offset' : -7200,
          'timezone_id' : 'America/Scoresbysund'
        }
      ],
      'chadt' :
      [
        {'dst' : true,
          'offset' : 49500,
          'timezone_id' : 'Pacific/Chatham'
        },{
          'dst' : true,
          'offset' : 49500,
          'timezone_id' : 'NZ-CHAT'
        }
      ],
      'chast' :
      [
        {'dst' : false,
          'offset' : 45900,
          'timezone_id' : 'Pacific/Chatham'
        },{
          'dst' : false,
          'offset' : 45900,
          'timezone_id' : 'NZ-CHAT'
        }
      ],
      'chat' :
      [
        {'dst' : false,
          'offset' : 30600,
          'timezone_id' : 'Asia/Harbin'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Harbin'
        }
      ],
      'chdt' :
      [
        {'dst' : true,
          'offset' : -19800,
          'timezone_id' : 'America/Belize'
        }
      ],
      'chost' :
      [
        {'dst' : true,
          'offset' : 36000,
          'timezone_id' : 'Asia/Choibalsan'
        }
      ],
      'chot' :
      [
        {'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Choibalsan'
        }
      ],
      'cit' :
      [
        {'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Dili'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Makassar'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Pontianak'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Ujung_Pandang'
        }
      ],
      'cjt' :
      [
        {'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Sakhalin'
        }
      ],
      'ckhst' :
      [
        {'dst' : true,
          'offset' : -34200,
          'timezone_id' : 'Pacific/Rarotonga'
        }
      ],
      'ckt' :
      [
        {'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'Pacific/Rarotonga'
        }
      ],
      'clst' :
      [
        {'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Santiago'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Santiago'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'Antarctica/Palmer'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'Chile/Continental'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'Chile/Continental'
        }
      ],
      'clt' :
      [
        {'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Santiago'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Santiago'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'Antarctica/Palmer'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'Chile/Continental'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'Chile/Continental'
        }
      ],
      'cost' :
      [
        {'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Bogota'
        }
      ],
      'cot' :
      [
        {'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Bogota'
        }
      ],
      'cpt' :
      [
        {'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Chicago'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Atikokan'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Coral_Harbour'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Fort_Wayne'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Indianapolis'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Knox'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Marengo'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Petersburg'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Vevay'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Vincennes'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Winamac'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indianapolis'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Kentucky/Louisville'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Kentucky/Monticello'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Knox_IN'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Louisville'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Menominee'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Rainy_River'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Rankin_Inlet'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Winnipeg'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'Canada/Central'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'CST6CDT'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'US/Central'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'US/East-Indiana'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'US/Indiana-Starke'
        }
      ],
      'cst' :
      [
        {'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Chicago'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Havana'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'Cuba'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Atikokan'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Belize'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Cambridge_Bay'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Cancun'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Chihuahua'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Coral_Harbour'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Costa_Rica'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Detroit'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/El_Salvador'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Fort_Wayne'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Guatemala'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Hermosillo'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Indiana/Indianapolis'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Indiana/Knox'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Indiana/Marengo'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Indiana/Petersburg'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Indiana/Vevay'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Indiana/Vincennes'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Indiana/Winamac'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Indianapolis'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Iqaluit'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Kentucky/Louisville'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Kentucky/Monticello'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Knox_IN'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Louisville'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Managua'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Mazatlan'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Menominee'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Merida'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Mexico_City'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Monterrey'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/North_Dakota/Center'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/North_Dakota/New_Salem'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Pangnirtung'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Rainy_River'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Rankin_Inlet'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Regina'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Swift_Current'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Tegucigalpa'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'America/Winnipeg'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'Canada/Central'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'Canada/East-Saskatchewan'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'Canada/Saskatchewan'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'CST6CDT'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'Mexico/BajaSur'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'Mexico/General'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'US/Central'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'US/East-Indiana'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'US/Indiana-Starke'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'US/Michigan'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Chongqing'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Chungking'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Harbin'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Kashgar'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Macao'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Macau'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Shanghai'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Taipei'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Urumqi'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'PRC'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'ROC'
        },{
          'dst' : false,
          'offset' : 34200,
          'timezone_id' : 'Asia/Jayapura'
        },{
          'dst' : false,
          'offset' : 34200,
          'timezone_id' : 'Australia/Adelaide'
        },{
          'dst' : false,
          'offset' : 34200,
          'timezone_id' : 'Australia/Broken_Hill'
        },{
          'dst' : false,
          'offset' : 34200,
          'timezone_id' : 'Australia/Darwin'
        },{
          'dst' : false,
          'offset' : 34200,
          'timezone_id' : 'Australia/North'
        },{
          'dst' : false,
          'offset' : 34200,
          'timezone_id' : 'Australia/South'
        },{
          'dst' : false,
          'offset' : 34200,
          'timezone_id' : 'Australia/Yancowinna'
        },{
          'dst' : true,
          'offset' : 37800,
          'timezone_id' : 'Australia/Adelaide'
        },{
          'dst' : true,
          'offset' : 37800,
          'timezone_id' : 'Australia/Broken_Hill'
        },{
          'dst' : true,
          'offset' : 37800,
          'timezone_id' : 'Australia/Darwin'
        },{
          'dst' : true,
          'offset' : 37800,
          'timezone_id' : 'Australia/North'
        },{
          'dst' : true,
          'offset' : 37800,
          'timezone_id' : 'Australia/South'
        },{
          'dst' : true,
          'offset' : 37800,
          'timezone_id' : 'Australia/Yancowinna'
        }
      ],
      'cvst' :
      [
        {'dst' : true,
          'offset' : -3600,
          'timezone_id' : 'Atlantic/Cape_Verde'
        }
      ],
      'cvt' :
      [
        {'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Atlantic/Cape_Verde'
        },{
          'dst' : false,
          'offset' : -7200,
          'timezone_id' : 'Atlantic/Cape_Verde'
        }
      ],
      'cwst' :
      [
        {'dst' : false,
          'offset' : 31500,
          'timezone_id' : 'Australia/Eucla'
        },{
          'dst' : true,
          'offset' : 35100,
          'timezone_id' : 'Australia/Eucla'
        }
      ],
      'cwt' :
      [
        {'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Chicago'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Atikokan'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Coral_Harbour'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Fort_Wayne'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Indianapolis'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Knox'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Marengo'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Petersburg'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Vevay'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Vincennes'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Winamac'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Indianapolis'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Kentucky/Louisville'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Kentucky/Monticello'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Knox_IN'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Louisville'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Menominee'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Mexico_City'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Rainy_River'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Rankin_Inlet'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Winnipeg'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'Canada/Central'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'CST6CDT'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'Mexico/General'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'US/Central'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'US/East-Indiana'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'US/Indiana-Starke'
        }
      ],
      'chst' :
      [
        {'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Pacific/Guam'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Pacific/Saipan'
        }
      ],
      'dact' :
      [
        {'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Dacca'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Dhaka'
        }
      ],
      'davt' :
      [
        {'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Antarctica/Davis'
        }
      ],
      'ddut' :
      [
        {'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Antarctica/DumontDUrville'
        }
      ],
      'dusst' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Dushanbe'
        },{
          'dst' : true,
          'offset' : 25200,
          'timezone_id' : 'Asia/Dushanbe'
        }
      ],
      'dust' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Dushanbe'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Dushanbe'
        }
      ],
      'easst' :
      [
        {'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'Chile/EasterIsland'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Chile/EasterIsland'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'Pacific/Easter'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Pacific/Easter'
        }
      ],
      'east' :
      [
        {'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'Chile/EasterIsland'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'Chile/EasterIsland'
        },{
          'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'Pacific/Easter'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'Pacific/Easter'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Indian/Antananarivo'
        }
      ],
      'eat' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Africa/Khartoum'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Africa/Addis_Ababa'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Africa/Asmara'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Africa/Asmera'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Africa/Dar_es_Salaam'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Africa/Djibouti'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Africa/Kampala'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Africa/Mogadishu'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Africa/Nairobi'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Indian/Antananarivo'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Indian/Comoro'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Indian/Mayotte'
        }
      ],
      'ect' :
      [
        {'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Guayaquil'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'Pacific/Galapagos'
        }
      ],
      'eddt' :
      [
        {'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Iqaluit'
        }
      ],
      'edt' :
      [
        {'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/New_York'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Cancun'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Detroit'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Fort_Wayne'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Grand_Turk'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Indiana/Indianapolis'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Indiana/Marengo'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Indiana/Vevay'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Indiana/Vincennes'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Indiana/Winamac'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Indianapolis'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Iqaluit'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Jamaica'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Kentucky/Louisville'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Kentucky/Monticello'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Louisville'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Montreal'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Nassau'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Nipigon'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Pangnirtung'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Port-au-Prince'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Santo_Domingo'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Thunder_Bay'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Toronto'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'Canada/Eastern'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'EST'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'EST5EDT'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'Jamaica'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'US/East-Indiana'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'US/Eastern'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'US/Michigan'
        }
      ],
      'eest' :
      [
        {'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Helsinki'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Africa/Cairo'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Asia/Amman'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Asia/Beirut'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Asia/Damascus'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Asia/Gaza'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Asia/Istanbul'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Asia/Nicosia'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'EET'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Egypt'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Athens'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Bucharest'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Chisinau'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Istanbul'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Kaliningrad'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Kiev'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Mariehamn'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Minsk'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Moscow'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Nicosia'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Riga'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Simferopol'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Sofia'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Tallinn'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Tiraspol'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Uzhgorod'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Vilnius'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Warsaw'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Zaporozhye'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Poland'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Turkey'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'W-SU'
        }
      ],
      'eet' :
      [
        {'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Helsinki'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Asia/Gaza'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Cairo'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Tripoli'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Asia/Amman'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Asia/Beirut'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Asia/Damascus'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Asia/Gaza'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Asia/Istanbul'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Asia/Nicosia'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'EET'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Egypt'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Athens'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Bucharest'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Chisinau'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Istanbul'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Kaliningrad'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Kiev'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Mariehamn'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Minsk'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Moscow'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Nicosia'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Riga'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Simferopol'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Sofia'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Tallinn'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Tiraspol'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Uzhgorod'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Vilnius'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Warsaw'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Europe/Zaporozhye'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Libya'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Poland'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Turkey'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'W-SU'
        }
      ],
      'egst' :
      [
        {'dst' : true,
          'offset' : 0,
          'timezone_id' : 'America/Scoresbysund'
        }
      ],
      'egt' :
      [
        {'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'America/Scoresbysund'
        }
      ],
      'ehdt' :
      [
        {'dst' : true,
          'offset' : -16200,
          'timezone_id' : 'America/Santo_Domingo'
        }
      ],
      'eit' :
      [
        {'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Jayapura'
        }
      ],
      'ept' :
      [
        {'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/New_York'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Detroit'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Iqaluit'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Montreal'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Nipigon'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Thunder_Bay'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Toronto'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'Canada/Eastern'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'EST'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'EST5EDT'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'US/Eastern'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'US/Michigan'
        }
      ],
      'est' :
      [
        {'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/New_York'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Antigua'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Atikokan'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Cambridge_Bay'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Cancun'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Cayman'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Chicago'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Coral_Harbour'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Detroit'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Fort_Wayne'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Grand_Turk'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Indianapolis'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Knox'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Marengo'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Petersburg'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Vevay'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Vincennes'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Indiana/Winamac'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Indianapolis'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Iqaluit'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Jamaica'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Kentucky/Louisville'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Kentucky/Monticello'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Knox_IN'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Louisville'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Managua'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Menominee'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Merida'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Montreal'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Nassau'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Nipigon'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Panama'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Pangnirtung'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Port-au-Prince'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Rankin_Inlet'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Santo_Domingo'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Thunder_Bay'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Toronto'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'Canada/Eastern'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'EST'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'EST5EDT'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'Jamaica'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'US/Central'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'US/East-Indiana'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'US/Eastern'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'US/Indiana-Starke'
        },{
          'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'US/Michigan'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/ACT'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/Brisbane'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/Canberra'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/Currie'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/Hobart'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/Lindeman'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/Melbourne'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/NSW'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/Queensland'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/Sydney'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/Tasmania'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Australia/Victoria'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/Melbourne'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/ACT'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/Brisbane'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/Canberra'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/Currie'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/Hobart'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/Lindeman'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/NSW'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/Queensland'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/Sydney'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/Tasmania'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/Victoria'
        }
      ],
      'ewt' :
      [
        {'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/New_York'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Detroit'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Iqaluit'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Montreal'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Nipigon'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Thunder_Bay'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Toronto'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'Canada/Eastern'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'EST'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'EST5EDT'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'US/Eastern'
        },{
          'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'US/Michigan'
        }
      ],
      'fjst' :
      [
        {'dst' : true,
          'offset' : 46800,
          'timezone_id' : 'Pacific/Fiji'
        }
      ],
      'fjt' :
      [
        {'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'Pacific/Fiji'
        }
      ],
      'fkst' :
      [
        {'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'Atlantic/Stanley'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'Atlantic/Stanley'
        }
      ],
      'fkt' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'Atlantic/Stanley'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'Atlantic/Stanley'
        }
      ],
      'fnst' :
      [
        {'dst' : true,
          'offset' : -3600,
          'timezone_id' : 'America/Noronha'
        },{
          'dst' : true,
          'offset' : -3600,
          'timezone_id' : 'Brazil/DeNoronha'
        }
      ],
      'fnt' :
      [
        {'dst' : false,
          'offset' : -7200,
          'timezone_id' : 'America/Noronha'
        },{
          'dst' : false,
          'offset' : -7200,
          'timezone_id' : 'Brazil/DeNoronha'
        }
      ],
      'fort' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Aqtau'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Aqtau'
        }
      ],
      'frust' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Bishkek'
        },{
          'dst' : true,
          'offset' : 25200,
          'timezone_id' : 'Asia/Bishkek'
        }
      ],
      'frut' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Bishkek'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Bishkek'
        }
      ],
      'galt' :
      [
        {'dst' : false,
          'offset' : -21600,
          'timezone_id' : 'Pacific/Galapagos'
        }
      ],
      'gamt' :
      [
        {'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'Pacific/Gambier'
        }
      ],
      'gbgt' :
      [
        {'dst' : false,
          'offset' : -13500,
          'timezone_id' : 'America/Guyana'
        }
      ],
      'gest' :
      [
        {'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Asia/Tbilisi'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Tbilisi'
        }
      ],
      'get' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Tbilisi'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Tbilisi'
        }
      ],
      'gft' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Cayenne'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Cayenne'
        }
      ],
      'ghst' :
      [
        {'dst' : true,
          'offset' : 1200,
          'timezone_id' : 'Africa/Accra'
        }
      ],
      'gmt' :
      [
        {'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Abidjan'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Accra'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Bamako'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Banjul'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Bissau'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Conakry'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Dakar'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Freetown'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Malabo'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Monrovia'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Niamey'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Nouakchott'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Ouagadougou'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Porto-Novo'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Sao_Tome'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Timbuktu'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'America/Danmarkshavn'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Atlantic/Reykjavik'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Atlantic/St_Helena'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Eire'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Belfast'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Dublin'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Gibraltar'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Guernsey'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Isle_of_Man'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Jersey'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/London'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'GB'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'GB-Eire'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Iceland'
        }
      ],
      'gst' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Dubai'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Bahrain'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Muscat'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Qatar'
        }
      ],
      'gyt' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Guyana'
        },{
          'dst' : false,
          'offset' : -13500,
          'timezone_id' : 'America/Guyana'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Guyana'
        }
      ],
      'hadt' :
      [
        {'dst' : true,
          'offset' : -32400,
          'timezone_id' : 'America/Adak'
        },{
          'dst' : true,
          'offset' : -32400,
          'timezone_id' : 'America/Atka'
        },{
          'dst' : true,
          'offset' : -32400,
          'timezone_id' : 'US/Aleutian'
        }
      ],
      'hast' :
      [
        {'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'America/Adak'
        },{
          'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'America/Atka'
        },{
          'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'US/Aleutian'
        }
      ],
      'hdt' :
      [
        {'dst' : true,
          'offset' : -34200,
          'timezone_id' : 'Pacific/Honolulu'
        },{
          'dst' : true,
          'offset' : -34200,
          'timezone_id' : 'HST'
        },{
          'dst' : true,
          'offset' : -34200,
          'timezone_id' : 'US/Hawaii'
        }
      ],
      'hkst' :
      [
        {'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Hong_Kong'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Hongkong'
        }
      ],
      'hkt' :
      [
        {'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Hong_Kong'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Hongkong'
        }
      ],
      'hovst' :
      [
        {'dst' : true,
          'offset' : 28800,
          'timezone_id' : 'Asia/Hovd'
        }
      ],
      'hovt' :
      [
        {'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Hovd'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Hovd'
        }
      ],
      'hpt' :
      [
        {'dst' : true,
          'offset' : -34200,
          'timezone_id' : 'Pacific/Honolulu'
        },{
          'dst' : true,
          'offset' : -34200,
          'timezone_id' : 'HST'
        },{
          'dst' : true,
          'offset' : -34200,
          'timezone_id' : 'US/Hawaii'
        }
      ],
      'hst' :
      [
        {'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'Pacific/Honolulu'
        },{
          'dst' : false,
          'offset' : -37800,
          'timezone_id' : 'Pacific/Honolulu'
        },{
          'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'HST'
        },{
          'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'US/Hawaii'
        },{
          'dst' : false,
          'offset' : -37800,
          'timezone_id' : 'HST'
        },{
          'dst' : false,
          'offset' : -37800,
          'timezone_id' : 'US/Hawaii'
        }
      ],
      'hwt' :
      [
        {'dst' : true,
          'offset' : -34200,
          'timezone_id' : 'Pacific/Honolulu'
        },{
          'dst' : true,
          'offset' : -34200,
          'timezone_id' : 'HST'
        },{
          'dst' : true,
          'offset' : -34200,
          'timezone_id' : 'US/Hawaii'
        }
      ],
      'ict' :
      [
        {'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Bangkok'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Phnom_Penh'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Saigon'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Vientiane'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Phnom_Penh'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Saigon'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Vientiane'
        }
      ],
      'iddt' :
      [
        {'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Asia/Jerusalem'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Asia/Tel_Aviv'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Israel'
        }
      ],
      'idt' :
      [
        {'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Asia/Jerusalem'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Asia/Gaza'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Asia/Tel_Aviv'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Israel'
        }
      ],
      'ihst' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Colombo'
        }
      ],
      'iot' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Indian/Chagos'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Indian/Chagos'
        }
      ],
      'irdt' :
      [
        {'dst' : true,
          'offset' : 16200,
          'timezone_id' : 'Asia/Tehran'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Tehran'
        },{
          'dst' : true,
          'offset' : 16200,
          'timezone_id' : 'Iran'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Iran'
        }
      ],
      'irkst' :
      [
        {'dst' : true,
          'offset' : 28800,
          'timezone_id' : 'Asia/Irkutsk'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Irkutsk'
        }
      ],
      'irkt' :
      [
        {'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Irkutsk'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Irkutsk'
        }
      ],
      'irst' :
      [
        {'dst' : false,
          'offset' : 12600,
          'timezone_id' : 'Asia/Tehran'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Tehran'
        },{
          'dst' : false,
          'offset' : 12600,
          'timezone_id' : 'Iran'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Iran'
        }
      ],
      'isst' :
      [
        {'dst' : true,
          'offset' : 0,
          'timezone_id' : 'Atlantic/Reykjavik'
        },{
          'dst' : true,
          'offset' : 0,
          'timezone_id' : 'Iceland'
        }
      ],
      'ist' :
      [
        {'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Asia/Jerusalem'
        },{
          'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Atlantic/Reykjavik'
        },{
          'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Iceland'
        },{
          'dst' : false,
          'offset' : 19800,
          'timezone_id' : 'Asia/Calcutta'
        },{
          'dst' : false,
          'offset' : 19800,
          'timezone_id' : 'Asia/Colombo'
        },{
          'dst' : false,
          'offset' : 19800,
          'timezone_id' : 'Asia/Dacca'
        },{
          'dst' : false,
          'offset' : 19800,
          'timezone_id' : 'Asia/Dhaka'
        },{
          'dst' : false,
          'offset' : 19800,
          'timezone_id' : 'Asia/Karachi'
        },{
          'dst' : false,
          'offset' : 19800,
          'timezone_id' : 'Asia/Katmandu'
        },{
          'dst' : false,
          'offset' : 19800,
          'timezone_id' : 'Asia/Thimbu'
        },{
          'dst' : false,
          'offset' : 19800,
          'timezone_id' : 'Asia/Thimphu'
        },{
          'dst' : true,
          'offset' : 2079,
          'timezone_id' : 'Eire'
        },{
          'dst' : true,
          'offset' : 2079,
          'timezone_id' : 'Europe/Dublin'
        },{
          'dst' : true,
          'offset' : 23400,
          'timezone_id' : 'Asia/Calcutta'
        },{
          'dst' : true,
          'offset' : 23400,
          'timezone_id' : 'Asia/Colombo'
        },{
          'dst' : true,
          'offset' : 23400,
          'timezone_id' : 'Asia/Karachi'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Eire'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Dublin'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Eire'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Dublin'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Asia/Gaza'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Asia/Tel_Aviv'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Israel'
        }
      ],
      'javt' :
      [
        {'dst' : false,
          'offset' : 26400,
          'timezone_id' : 'Asia/Jakarta'
        }
      ],
      'jdt' :
      [
        {'dst' : true,
          'offset' : 36000,
          'timezone_id' : 'Asia/Tokyo'
        },{
          'dst' : true,
          'offset' : 36000,
          'timezone_id' : 'Japan'
        }
      ],
      'jst' :
      [
        {'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Tokyo'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Dili'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Jakarta'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Kuala_Lumpur'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Kuching'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Makassar'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Manila'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Pontianak'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Rangoon'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Sakhalin'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Singapore'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Ujung_Pandang'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Japan'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Pacific/Nauru'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Singapore'
        }
      ],
      'kart' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Karachi'
        }
      ],
      'kast' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Kashgar'
        },{
          'dst' : false,
          'offset' : 19800,
          'timezone_id' : 'Asia/Kashgar'
        }
      ],
      'kdt' :
      [
        {'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Seoul'
        },{
          'dst' : true,
          'offset' : 36000,
          'timezone_id' : 'Asia/Seoul'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'ROK'
        },{
          'dst' : true,
          'offset' : 36000,
          'timezone_id' : 'ROK'
        }
      ],
      'kgst' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Bishkek'
        }
      ],
      'kgt' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Bishkek'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Bishkek'
        }
      ],
      'kizst' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Qyzylorda'
        }
      ],
      'kizt' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Qyzylorda'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Qyzylorda'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Qyzylorda'
        }
      ],
      'kmt' :
      [
        {'dst' : false,
          'offset' : 5736,
          'timezone_id' : 'Europe/Vilnius'
        }
      ],
      'kost' :
      [
        {'dst' : false,
          'offset' : 39600,
          'timezone_id' : 'Pacific/Kosrae'
        },{
          'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'Pacific/Kosrae'
        }
      ],
      'krast' :
      [
        {'dst' : true,
          'offset' : 25200,
          'timezone_id' : 'Asia/Krasnoyarsk'
        },{
          'dst' : true,
          'offset' : 28800,
          'timezone_id' : 'Asia/Krasnoyarsk'
        }
      ],
      'krat' :
      [
        {'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Krasnoyarsk'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Krasnoyarsk'
        }
      ],
      'kst' :
      [
        {'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Seoul'
        },{
          'dst' : false,
          'offset' : 30600,
          'timezone_id' : 'Asia/Seoul'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Seoul'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Pyongyang'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'ROK'
        },{
          'dst' : false,
          'offset' : 30600,
          'timezone_id' : 'Asia/Pyongyang'
        },{
          'dst' : false,
          'offset' : 30600,
          'timezone_id' : 'ROK'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Pyongyang'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'ROK'
        }
      ],
      'kuyst' :
      [
        {'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Europe/Samara'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Samara'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Europe/Samara'
        }
      ],
      'kuyt' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Samara'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Europe/Samara'
        }
      ],
      'kwat' :
      [
        {'dst' : false,
          'offset' : -43200,
          'timezone_id' : 'Pacific/Kwajalein'
        },{
          'dst' : false,
          'offset' : -43200,
          'timezone_id' : 'Kwajalein'
        }
      ],
      'lhst' :
      [
        {'dst' : false,
          'offset' : 37800,
          'timezone_id' : 'Australia/Lord_Howe'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/Lord_Howe'
        },{
          'dst' : true,
          'offset' : 41400,
          'timezone_id' : 'Australia/Lord_Howe'
        },{
          'dst' : false,
          'offset' : 37800,
          'timezone_id' : 'Australia/LHI'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Australia/LHI'
        },{
          'dst' : true,
          'offset' : 41400,
          'timezone_id' : 'Australia/LHI'
        }
      ],
      'lint' :
      [
        {'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'Pacific/Kiritimati'
        },{
          'dst' : false,
          'offset' : 50400,
          'timezone_id' : 'Pacific/Kiritimati'
        }
      ],
      'lkt' :
      [
        {'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Colombo'
        },{
          'dst' : false,
          'offset' : 23400,
          'timezone_id' : 'Asia/Colombo'
        }
      ],
      'lont' :
      [
        {'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Chongqing'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Chungking'
        }
      ],
      'lrt' :
      [
        {'dst' : false,
          'offset' : -2670,
          'timezone_id' : 'Africa/Monrovia'
        }
      ],
      'lst' :
      [
        {'dst' : true,
          'offset' : 9384,
          'timezone_id' : 'Europe/Riga'
        }
      ],
      'madmt' :
      [
        {'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Atlantic/Madeira'
        }
      ],
      'madst' :
      [
        {'dst' : true,
          'offset' : 0,
          'timezone_id' : 'Atlantic/Madeira'
        }
      ],
      'madt' :
      [
        {'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Atlantic/Madeira'
        }
      ],
      'magst' :
      [
        {'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Asia/Magadan'
        },{
          'dst' : true,
          'offset' : 43200,
          'timezone_id' : 'Asia/Magadan'
        }
      ],
      'magt' :
      [
        {'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Asia/Magadan'
        },{
          'dst' : false,
          'offset' : 39600,
          'timezone_id' : 'Asia/Magadan'
        }
      ],
      'malst' :
      [
        {'dst' : true,
          'offset' : 26400,
          'timezone_id' : 'Asia/Singapore'
        },{
          'dst' : true,
          'offset' : 26400,
          'timezone_id' : 'Asia/Kuala_Lumpur'
        },{
          'dst' : true,
          'offset' : 26400,
          'timezone_id' : 'Singapore'
        }
      ],
      'malt' :
      [
        {'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Singapore'
        },{
          'dst' : false,
          'offset' : 26400,
          'timezone_id' : 'Asia/Singapore'
        },{
          'dst' : false,
          'offset' : 27000,
          'timezone_id' : 'Asia/Singapore'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Kuala_Lumpur'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Singapore'
        },{
          'dst' : false,
          'offset' : 26400,
          'timezone_id' : 'Asia/Kuala_Lumpur'
        },{
          'dst' : false,
          'offset' : 26400,
          'timezone_id' : 'Singapore'
        },{
          'dst' : false,
          'offset' : 27000,
          'timezone_id' : 'Asia/Kuala_Lumpur'
        },{
          'dst' : false,
          'offset' : 27000,
          'timezone_id' : 'Singapore'
        }
      ],
      'mart' :
      [
        {'dst' : false,
          'offset' : -34200,
          'timezone_id' : 'Pacific/Marquesas'
        }
      ],
      'mawt' :
      [
        {'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Antarctica/Mawson'
        }
      ],
      'mddt' :
      [
        {'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Cambridge_Bay'
        },{
          'dst' : true,
          'offset' : -18000,
          'timezone_id' : 'America/Yellowknife'
        }
      ],
      'mdst' :
      [
        {'dst' : true,
          'offset' : 16248,
          'timezone_id' : 'Europe/Moscow'
        },{
          'dst' : true,
          'offset' : 16248,
          'timezone_id' : 'W-SU'
        }
      ],
      'mdt' :
      [
        {'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Denver'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Boise'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Cambridge_Bay'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Chihuahua'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Edmonton'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Hermosillo'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Inuvik'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Mazatlan'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/North_Dakota/Center'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/North_Dakota/New_Salem'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Phoenix'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Regina'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Shiprock'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Swift_Current'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Yellowknife'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Canada/East-Saskatchewan'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Canada/Mountain'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Canada/Saskatchewan'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Mexico/BajaSur'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'MST'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'MST7MDT'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Navajo'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'US/Arizona'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'US/Mountain'
        }
      ],
      'mest' :
      [
        {'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'MET'
        }
      ],
      'met' :
      [
        {'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'MET'
        }
      ],
      'mht' :
      [
        {'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'Pacific/Kwajalein'
        },{
          'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'Kwajalein'
        },{
          'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'Pacific/Majuro'
        }
      ],
      'mmt' :
      [
        {'dst' : false,
          'offset' : 9048,
          'timezone_id' : 'Europe/Moscow'
        },{
          'dst' : false,
          'offset' : 23400,
          'timezone_id' : 'Asia/Rangoon'
        },{
          'dst' : false,
          'offset' : 28656,
          'timezone_id' : 'Asia/Makassar'
        },{
          'dst' : false,
          'offset' : 28656,
          'timezone_id' : 'Asia/Ujung_Pandang'
        },{
          'dst' : false,
          'offset' : 9048,
          'timezone_id' : 'W-SU'
        }
      ],
      'most' :
      [
        {'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Macao'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Macau'
        }
      ],
      'mot' :
      [
        {'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Macao'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Macau'
        }
      ],
      'mpt' :
      [
        {'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Denver'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Boise'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Cambridge_Bay'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Edmonton'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/North_Dakota/Center'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/North_Dakota/New_Salem'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Regina'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Shiprock'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Swift_Current'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Yellowknife'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Canada/East-Saskatchewan'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Canada/Mountain'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Canada/Saskatchewan'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'MST'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'MST7MDT'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Navajo'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'US/Mountain'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Pacific/Saipan'
        }
      ],
      'msd' :
      [
        {'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Moscow'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Europe/Moscow'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Chisinau'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Kaliningrad'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Kiev'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Minsk'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Riga'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Simferopol'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Tallinn'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Tiraspol'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Uzhgorod'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Vilnius'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Zaporozhye'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'W-SU'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'W-SU'
        }
      ],
      'msk' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Moscow'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Chisinau'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Kaliningrad'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Kiev'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Minsk'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Riga'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Simferopol'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Tallinn'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Tiraspol'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Uzhgorod'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Vilnius'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Zaporozhye'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'W-SU'
        }
      ],
      'mst' :
      [
        {'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Denver'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Boise'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Cambridge_Bay'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Chihuahua'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Dawson_Creek'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Edmonton'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Ensenada'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Hermosillo'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Inuvik'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Mazatlan'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Mexico_City'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/North_Dakota/Center'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/North_Dakota/New_Salem'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Phoenix'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Regina'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Shiprock'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Swift_Current'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Tijuana'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'America/Yellowknife'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'Canada/East-Saskatchewan'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'Canada/Mountain'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'Canada/Saskatchewan'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'Mexico/BajaNorte'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'Mexico/BajaSur'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'Mexico/General'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'MST'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'MST7MDT'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'Navajo'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'US/Arizona'
        },{
          'dst' : false,
          'offset' : -25200,
          'timezone_id' : 'US/Mountain'
        },{
          'dst' : true,
          'offset' : 12648,
          'timezone_id' : 'Europe/Moscow'
        },{
          'dst' : true,
          'offset' : 12648,
          'timezone_id' : 'W-SU'
        }
      ],
      'mut' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Indian/Mauritius'
        }
      ],
      'mvt' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Indian/Maldives'
        }
      ],
      'mwt' :
      [
        {'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Denver'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Boise'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Cambridge_Bay'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Edmonton'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/North_Dakota/Center'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/North_Dakota/New_Salem'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Phoenix'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Regina'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Shiprock'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Swift_Current'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Yellowknife'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Canada/East-Saskatchewan'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Canada/Mountain'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Canada/Saskatchewan'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'MST'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'MST7MDT'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'Navajo'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'US/Arizona'
        },{
          'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'US/Mountain'
        }
      ],
      'myt' :
      [
        {'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Kuala_Lumpur'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Kuching'
        }
      ],
      'ncst' :
      [
        {'dst' : true,
          'offset' : 43200,
          'timezone_id' : 'Pacific/Noumea'
        }
      ],
      'nct' :
      [
        {'dst' : false,
          'offset' : 39600,
          'timezone_id' : 'Pacific/Noumea'
        }
      ],
      'nddt' :
      [
        {'dst' : true,
          'offset' : -5400,
          'timezone_id' : 'America/St_Johns'
        },{
          'dst' : true,
          'offset' : -5400,
          'timezone_id' : 'Canada/Newfoundland'
        }
      ],
      'ndt' :
      [
        {'dst' : true,
          'offset' : -9000,
          'timezone_id' : 'America/St_Johns'
        },{
          'dst' : true,
          'offset' : -9052,
          'timezone_id' : 'America/St_Johns'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'Pacific/Midway'
        },{
          'dst' : true,
          'offset' : -9000,
          'timezone_id' : 'America/Goose_Bay'
        },{
          'dst' : true,
          'offset' : -9000,
          'timezone_id' : 'Canada/Newfoundland'
        },{
          'dst' : true,
          'offset' : -9052,
          'timezone_id' : 'America/Goose_Bay'
        },{
          'dst' : true,
          'offset' : -9052,
          'timezone_id' : 'Canada/Newfoundland'
        }
      ],
      'negt' :
      [
        {'dst' : false,
          'offset' : -12600,
          'timezone_id' : 'America/Paramaribo'
        }
      ],
      'nest' :
      [
        {'dst' : true,
          'offset' : 4800,
          'timezone_id' : 'Europe/Amsterdam'
        }
      ],
      'net' :
      [
        {'dst' : false,
          'offset' : 1200,
          'timezone_id' : 'Europe/Amsterdam'
        }
      ],
      'nft' :
      [
        {'dst' : false,
          'offset' : 41400,
          'timezone_id' : 'Pacific/Norfolk'
        }
      ],
      'novst' :
      [
        {'dst' : true,
          'offset' : 25200,
          'timezone_id' : 'Asia/Novosibirsk'
        },{
          'dst' : true,
          'offset' : 28800,
          'timezone_id' : 'Asia/Novosibirsk'
        }
      ],
      'novt' :
      [
        {'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Novosibirsk'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Novosibirsk'
        }
      ],
      'npt' :
      [
        {'dst' : true,
          'offset' : -9000,
          'timezone_id' : 'America/St_Johns'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'America/Adak'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'America/Atka'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'America/Nome'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'US/Aleutian'
        },{
          'dst' : true,
          'offset' : -9000,
          'timezone_id' : 'America/Goose_Bay'
        },{
          'dst' : true,
          'offset' : -9000,
          'timezone_id' : 'Canada/Newfoundland'
        },{
          'dst' : false,
          'offset' : 20700,
          'timezone_id' : 'Asia/Katmandu'
        }
      ],
      'nrt' :
      [
        {'dst' : false,
          'offset' : 41400,
          'timezone_id' : 'Pacific/Nauru'
        },{
          'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'Pacific/Nauru'
        }
      ],
      'nst' :
      [
        {'dst' : false,
          'offset' : -12600,
          'timezone_id' : 'America/St_Johns'
        },{
          'dst' : false,
          'offset' : -12652,
          'timezone_id' : 'America/St_Johns'
        },{
          'dst' : false,
          'offset' : -12600,
          'timezone_id' : 'America/Goose_Bay'
        },{
          'dst' : false,
          'offset' : -12600,
          'timezone_id' : 'Canada/Newfoundland'
        },{
          'dst' : false,
          'offset' : -12652,
          'timezone_id' : 'America/Goose_Bay'
        },{
          'dst' : false,
          'offset' : -12652,
          'timezone_id' : 'Canada/Newfoundland'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'America/Adak'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'America/Atka'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'America/Nome'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Midway'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Pago_Pago'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Samoa'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'US/Aleutian'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'US/Samoa'
        },{
          'dst' : true,
          'offset' : 4772,
          'timezone_id' : 'Europe/Amsterdam'
        }
      ],
      'nut' :
      [
        {'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Niue'
        },{
          'dst' : false,
          'offset' : -41400,
          'timezone_id' : 'Pacific/Niue'
        }
      ],
      'nwt' :
      [
        {'dst' : true,
          'offset' : -9000,
          'timezone_id' : 'America/St_Johns'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'America/Adak'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'America/Atka'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'America/Nome'
        },{
          'dst' : true,
          'offset' : -36000,
          'timezone_id' : 'US/Aleutian'
        },{
          'dst' : true,
          'offset' : -9000,
          'timezone_id' : 'America/Goose_Bay'
        },{
          'dst' : true,
          'offset' : -9000,
          'timezone_id' : 'Canada/Newfoundland'
        }
      ],
      'nzdt' :
      [
        {'dst' : true,
          'offset' : 46800,
          'timezone_id' : 'Pacific/Auckland'
        },{
          'dst' : true,
          'offset' : 46800,
          'timezone_id' : 'Antarctica/McMurdo'
        },{
          'dst' : true,
          'offset' : 46800,
          'timezone_id' : 'Antarctica/South_Pole'
        },{
          'dst' : true,
          'offset' : 46800,
          'timezone_id' : 'NZ'
        }
      ],
      'nzmt' :
      [
        {'dst' : false,
          'offset' : 41400,
          'timezone_id' : 'Pacific/Auckland'
        },{
          'dst' : false,
          'offset' : 41400,
          'timezone_id' : 'NZ'
        }
      ],
      'nzst' :
      [
        {'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'Pacific/Auckland'
        },{
          'dst' : true,
          'offset' : 43200,
          'timezone_id' : 'Pacific/Auckland'
        },{
          'dst' : true,
          'offset' : 45000,
          'timezone_id' : 'Pacific/Auckland'
        },{
          'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'Antarctica/McMurdo'
        },{
          'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'Antarctica/South_Pole'
        },{
          'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'NZ'
        },{
          'dst' : true,
          'offset' : 43200,
          'timezone_id' : 'NZ'
        },{
          'dst' : true,
          'offset' : 45000,
          'timezone_id' : 'NZ'
        }
      ],
      'omsst' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Omsk'
        },{
          'dst' : true,
          'offset' : 25200,
          'timezone_id' : 'Asia/Omsk'
        }
      ],
      'omst' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Omsk'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Omsk'
        }
      ],
      'orast' :
      [
        {'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Oral'
        }
      ],
      'orat' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Oral'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Oral'
        }
      ],
      'pddt' :
      [
        {'dst' : true,
          'offset' : -21600,
          'timezone_id' : 'America/Inuvik'
        }
      ],
      'pdt' :
      [
        {'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Los_Angeles'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Boise'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Dawson'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Dawson_Creek'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Ensenada'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Inuvik'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Juneau'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Tijuana'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Vancouver'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Whitehorse'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'Canada/Pacific'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'Canada/Yukon'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'Mexico/BajaNorte'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'PST8PDT'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'US/Pacific'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'US/Pacific-New'
        }
      ],
      'pest' :
      [
        {'dst' : true,
          'offset' : -14400,
          'timezone_id' : 'America/Lima'
        }
      ],
      'petst' :
      [
        {'dst' : true,
          'offset' : 43200,
          'timezone_id' : 'Asia/Kamchatka'
        },{
          'dst' : true,
          'offset' : 46800,
          'timezone_id' : 'Asia/Kamchatka'
        }
      ],
      'pett' :
      [
        {'dst' : false,
          'offset' : 39600,
          'timezone_id' : 'Asia/Kamchatka'
        },{
          'dst' : false,
          'offset' : 43200,
          'timezone_id' : 'Asia/Kamchatka'
        }
      ],
      'pet' :
      [
        {'dst' : false,
          'offset' : -18000,
          'timezone_id' : 'America/Lima'
        }
      ],
      'phot' :
      [
        {'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Enderbury'
        },{
          'dst' : false,
          'offset' : 46800,
          'timezone_id' : 'Pacific/Enderbury'
        }
      ],
      'phst' :
      [
        {'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Manila'
        }
      ],
      'pht' :
      [
        {'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Manila'
        }
      ],
      'pkst' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Karachi'
        }
      ],
      'pkt' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Karachi'
        }
      ],
      'pmdt' :
      [
        {'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Miquelon'
        }
      ],
      'pmst' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Miquelon'
        }
      ],
      'pmt' :
      [
        {'dst' : false,
          'offset' : -13236,
          'timezone_id' : 'America/Paramaribo'
        },{
          'dst' : false,
          'offset' : -13252,
          'timezone_id' : 'America/Paramaribo'
        },{
          'dst' : false,
          'offset' : 26240,
          'timezone_id' : 'Asia/Pontianak'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Antarctica/DumontDUrville'
        }
      ],
      'ppt' :
      [
        {'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Los_Angeles'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Dawson_Creek'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Ensenada'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Inuvik'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Juneau'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Tijuana'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Vancouver'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'Canada/Pacific'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'Mexico/BajaNorte'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'PST8PDT'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'US/Pacific'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'US/Pacific-New'
        }
      ],
      'pst' :
      [
        {'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Los_Angeles'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Boise'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Dawson'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Dawson_Creek'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Ensenada'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Hermosillo'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Inuvik'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Juneau'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Mazatlan'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Tijuana'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Vancouver'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'America/Whitehorse'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'Canada/Pacific'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'Canada/Yukon'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'Mexico/BajaNorte'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'Mexico/BajaSur'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'Pacific/Pitcairn'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'PST8PDT'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'US/Pacific'
        },{
          'dst' : false,
          'offset' : -28800,
          'timezone_id' : 'US/Pacific-New'
        }
      ],
      'pwt' :
      [
        {'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Los_Angeles'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Dawson_Creek'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Ensenada'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Inuvik'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Juneau'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Tijuana'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Vancouver'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'Canada/Pacific'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'Mexico/BajaNorte'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'PST8PDT'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'US/Pacific'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'US/Pacific-New'
        }
      ],
      'pyst' :
      [
        {'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Asuncion'
        }
      ],
      'pyt' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Asuncion'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Asuncion'
        }
      ],
      'qyzst' :
      [
        {'dst' : true,
          'offset' : 25200,
          'timezone_id' : 'Asia/Qyzylorda'
        }
      ],
      'qyzt' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Qyzylorda'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Qyzylorda'
        }
      ],
      'ret' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Indian/Reunion'
        }
      ],
      'rmt' :
      [
        {'dst' : false,
          'offset' : 5784,
          'timezone_id' : 'Europe/Riga'
        }
      ],
      'rott' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'Antarctica/Rothera'
        }
      ],
      'sakst' :
      [
        {'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Asia/Sakhalin'
        },{
          'dst' : true,
          'offset' : 43200,
          'timezone_id' : 'Asia/Sakhalin'
        }
      ],
      'sakt' :
      [
        {'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Asia/Sakhalin'
        },{
          'dst' : false,
          'offset' : 39600,
          'timezone_id' : 'Asia/Sakhalin'
        }
      ],
      'samst' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Samarkand'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Europe/Samara'
        }
      ],
      'samt' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Samarkand'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Samarkand'
        },{
          'dst' : false,
          'offset' : -41400,
          'timezone_id' : 'Pacific/Apia'
        },{
          'dst' : false,
          'offset' : -41400,
          'timezone_id' : 'Pacific/Pago_Pago'
        },{
          'dst' : false,
          'offset' : -41400,
          'timezone_id' : 'Pacific/Samoa'
        },{
          'dst' : false,
          'offset' : -41400,
          'timezone_id' : 'US/Samoa'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Samara'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Europe/Samara'
        }
      ],
      'sast' :
      [
        {'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Africa/Johannesburg'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Johannesburg'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Africa/Maseru'
        },{
          'dst' : true,
          'offset' : 10800,
          'timezone_id' : 'Africa/Windhoek'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Maseru'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Mbabane'
        },{
          'dst' : false,
          'offset' : 7200,
          'timezone_id' : 'Africa/Windhoek'
        }
      ],
      'sbt' :
      [
        {'dst' : false,
          'offset' : 39600,
          'timezone_id' : 'Pacific/Guadalcanal'
        }
      ],
      'sct' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Indian/Mahe'
        }
      ],
      'sgt' :
      [
        {'dst' : false,
          'offset' : 27000,
          'timezone_id' : 'Asia/Singapore'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Singapore'
        },{
          'dst' : false,
          'offset' : 27000,
          'timezone_id' : 'Singapore'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Singapore'
        }
      ],
      'shest' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Aqtau'
        }
      ],
      'shet' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Aqtau'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Aqtau'
        }
      ],
      'slst' :
      [
        {'dst' : true,
          'offset' : -1200,
          'timezone_id' : 'Africa/Freetown'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Africa/Freetown'
        }
      ],
      'smt' :
      [
        {'dst' : false,
          'offset' : 25580,
          'timezone_id' : 'Asia/Saigon'
        },{
          'dst' : false,
          'offset' : -16966,
          'timezone_id' : 'America/Santiago'
        },{
          'dst' : false,
          'offset' : -16966,
          'timezone_id' : 'Chile/Continental'
        },{
          'dst' : false,
          'offset' : 25580,
          'timezone_id' : 'Asia/Phnom_Penh'
        },{
          'dst' : false,
          'offset' : 25580,
          'timezone_id' : 'Asia/Vientiane'
        }
      ],
      'srt' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Paramaribo'
        },{
          'dst' : false,
          'offset' : -12600,
          'timezone_id' : 'America/Paramaribo'
        }
      ],
      'sst' :
      [
        {'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Samoa'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Midway'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Pago_Pago'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'US/Samoa'
        }
      ],
      'stat' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Volgograd'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Europe/Volgograd'
        }
      ],
      'svest' :
      [
        {'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Yekaterinburg'
        },{
          'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Yekaterinburg'
        }
      ],
      'svet' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Yekaterinburg'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Yekaterinburg'
        }
      ],
      'syot' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Antarctica/Syowa'
        }
      ],
      'taht' :
      [
        {'dst' : false,
          'offset' : -36000,
          'timezone_id' : 'Pacific/Tahiti'
        }
      ],
      'tasst' :
      [
        {'dst' : true,
          'offset' : 25200,
          'timezone_id' : 'Asia/Samarkand'
        },{
          'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Tashkent'
        },{
          'dst' : true,
          'offset' : 25200,
          'timezone_id' : 'Asia/Tashkent'
        }
      ],
      'tast' :
      [
        {'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Samarkand'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Tashkent'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Tashkent'
        }
      ],
      'tbist' :
      [
        {'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Asia/Tbilisi'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Tbilisi'
        }
      ],
      'tbit' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Tbilisi'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Tbilisi'
        }
      ],
      'tft' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Indian/Kerguelen'
        }
      ],
      'tjt' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Dushanbe'
        }
      ],
      'tlt' :
      [
        {'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Dili'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Dili'
        }
      ],
      'tmt' :
      [
        {'dst' : false,
          'offset' : 12344,
          'timezone_id' : 'Asia/Tehran'
        },{
          'dst' : false,
          'offset' : 12344,
          'timezone_id' : 'Iran'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Ashgabat'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Ashkhabad'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Ashgabat'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Ashkhabad'
        },{
          'dst' : false,
          'offset' : 5940,
          'timezone_id' : 'Europe/Tallinn'
        }
      ],
      'tost' :
      [
        {'dst' : true,
          'offset' : 50400,
          'timezone_id' : 'Pacific/Tongatapu'
        }
      ],
      'tot' :
      [
        {'dst' : false,
          'offset' : 46800,
          'timezone_id' : 'Pacific/Tongatapu'
        }
      ],
      'trst' :
      [
        {'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Istanbul'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Asia/Istanbul'
        },{
          'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Turkey'
        }
      ],
      'trt' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Istanbul'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Istanbul'
        },{
          'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Turkey'
        }
      ],
      'tsat' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Volgograd'
        }
      ],
      'ulast' :
      [
        {'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Ulaanbaatar'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Ulan_Bator'
        }
      ],
      'ulat' :
      [
        {'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Ulaanbaatar'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Ulaanbaatar'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Choibalsan'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Ulan_Bator'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Choibalsan'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Ulan_Bator'
        }
      ],
      'urast' :
      [
        {'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Oral'
        },{
          'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Oral'
        }
      ],
      'urat' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Oral'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Oral'
        },{
          'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Oral'
        }
      ],
      'urut' :
      [
        {'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Asia/Urumqi'
        }
      ],
      'uyhst' :
      [
        {'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Montevideo'
        },{
          'dst' : true,
          'offset' : -9000,
          'timezone_id' : 'America/Montevideo'
        }
      ],
      'uyst' :
      [
        {'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Montevideo'
        }
      ],
      'uyt' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Montevideo'
        },{
          'dst' : false,
          'offset' : -12600,
          'timezone_id' : 'America/Montevideo'
        }
      ],
      'uzst' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Samarkand'
        },{
          'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Tashkent'
        }
      ],
      'uzt' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Samarkand'
        },{
          'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Tashkent'
        }
      ],
      'vet' :
      [
        {'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Caracas'
        },{
          'dst' : false,
          'offset' : -16200,
          'timezone_id' : 'America/Caracas'
        }
      ],
      'vlasst' :
      [
        {'dst' : true,
          'offset' : 36000,
          'timezone_id' : 'Asia/Vladivostok'
        }
      ],
      'vlast' :
      [
        {'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Vladivostok'
        },{
          'dst' : true,
          'offset' : 39600,
          'timezone_id' : 'Asia/Vladivostok'
        }
      ],
      'vlat' :
      [
        {'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Vladivostok'
        },{
          'dst' : false,
          'offset' : 36000,
          'timezone_id' : 'Asia/Vladivostok'
        }
      ],
      'volst' :
      [
        {'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Europe/Volgograd'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Europe/Volgograd'
        }
      ],
      'volt' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Europe/Volgograd'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Europe/Volgograd'
        }
      ],
      'vost' :
      [
        {'dst' : false,
          'offset' : 21600,
          'timezone_id' : 'Antarctica/Vostok'
        }
      ],
      'vust' :
      [
        {'dst' : true,
          'offset' : 43200,
          'timezone_id' : 'Pacific/Efate'
        }
      ],
      'vut' :
      [
        {'dst' : false,
          'offset' : 39600,
          'timezone_id' : 'Pacific/Efate'
        }
      ],
      'warst' :
      [
        {'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Mendoza'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Jujuy'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Argentina/Mendoza'
        },{
          'dst' : true,
          'offset' : -10800,
          'timezone_id' : 'America/Jujuy'
        }
      ],
      'wart' :
      [
        {'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Mendoza'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Catamarca'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/ComodRivadavia'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Cordoba'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Jujuy'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/La_Rioja'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Mendoza'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Rio_Gallegos'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/San_Juan'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Tucuman'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Argentina/Ushuaia'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Catamarca'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Cordoba'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Jujuy'
        },{
          'dst' : false,
          'offset' : -14400,
          'timezone_id' : 'America/Rosario'
        }
      ],
      'wast' :
      [
        {'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Africa/Windhoek'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Africa/Ndjamena'
        }
      ],
      'wat' :
      [
        {'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Africa/Dakar'
        },{
          'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Africa/Bamako'
        },{
          'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Africa/Banjul'
        },{
          'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Africa/Bissau'
        },{
          'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Africa/Conakry'
        },{
          'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Africa/El_Aaiun'
        },{
          'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Africa/Freetown'
        },{
          'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Africa/Niamey'
        },{
          'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Africa/Nouakchott'
        },{
          'dst' : false,
          'offset' : -3600,
          'timezone_id' : 'Africa/Timbuktu'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Freetown'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Brazzaville'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Bangui'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Douala'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Lagos'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Libreville'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Luanda'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Malabo'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Ndjamena'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Niamey'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Porto-Novo'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Africa/Windhoek'
        }
      ],
      'wemt' :
      [
        {'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Lisbon'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Madrid'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Monaco'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Paris'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Portugal'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'WET'
        }
      ],
      'west' :
      [
        {'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Paris'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Africa/Algiers'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Africa/Casablanca'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Africa/Ceuta'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Atlantic/Canary'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Atlantic/Faeroe'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Atlantic/Faroe'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Atlantic/Madeira'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Brussels'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Lisbon'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Luxembourg'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Madrid'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Europe/Monaco'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'Portugal'
        },{
          'dst' : true,
          'offset' : 3600,
          'timezone_id' : 'WET'
        },{
          'dst' : true,
          'offset' : 7200,
          'timezone_id' : 'Europe/Luxembourg'
        }
      ],
      'wet' :
      [
        {'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Paris'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Algiers'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Casablanca'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/Ceuta'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Africa/El_Aaiun'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Atlantic/Azores'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Atlantic/Canary'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Atlantic/Faeroe'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Atlantic/Faroe'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Atlantic/Madeira'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Brussels'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Lisbon'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Luxembourg'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Madrid'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Europe/Monaco'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Portugal'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'WET'
        },{
          'dst' : false,
          'offset' : 3600,
          'timezone_id' : 'Europe/Luxembourg'
        }
      ],
      'wgst' :
      [
        {'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Godthab'
        },{
          'dst' : true,
          'offset' : -7200,
          'timezone_id' : 'America/Danmarkshavn'
        }
      ],
      'wgt' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Godthab'
        },{
          'dst' : false,
          'offset' : -10800,
          'timezone_id' : 'America/Danmarkshavn'
        }
      ],
      'wit' :
      [
        {'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Jakarta'
        },{
          'dst' : false,
          'offset' : 27000,
          'timezone_id' : 'Asia/Jakarta'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Jakarta'
        },{
          'dst' : false,
          'offset' : 25200,
          'timezone_id' : 'Asia/Pontianak'
        },{
          'dst' : false,
          'offset' : 27000,
          'timezone_id' : 'Asia/Pontianak'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Pontianak'
        }
      ],
      'wst' :
      [
        {'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Australia/Perth'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Australia/Perth'
        },{
          'dst' : false,
          'offset' : -39600,
          'timezone_id' : 'Pacific/Apia'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Antarctica/Casey'
        },{
          'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Australia/West'
        },{
          'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Australia/West'
        }
      ],
      'yakst' :
      [
        {'dst' : true,
          'offset' : 32400,
          'timezone_id' : 'Asia/Yakutsk'
        },{
          'dst' : true,
          'offset' : 36000,
          'timezone_id' : 'Asia/Yakutsk'
        }
      ],
      'yakt' :
      [
        {'dst' : false,
          'offset' : 28800,
          'timezone_id' : 'Asia/Yakutsk'
        },{
          'dst' : false,
          'offset' : 32400,
          'timezone_id' : 'Asia/Yakutsk'
        }
      ],
      'yddt' :
      [
        {'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Dawson'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'America/Whitehorse'
        },{
          'dst' : true,
          'offset' : -25200,
          'timezone_id' : 'Canada/Yukon'
        }
      ],
      'ydt' :
      [
        {'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Dawson'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Whitehorse'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Yakutat'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'Canada/Yukon'
        }
      ],
      'yekst' :
      [
        {'dst' : true,
          'offset' : 21600,
          'timezone_id' : 'Asia/Yekaterinburg'
        }
      ],
      'yekt' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : 'Asia/Yekaterinburg'
        }
      ],
      'yerst' :
      [
        {'dst' : true,
          'offset' : 14400,
          'timezone_id' : 'Asia/Yerevan'
        },{
          'dst' : true,
          'offset' : 18000,
          'timezone_id' : 'Asia/Yerevan'
        }
      ],
      'yert' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : 'Asia/Yerevan'
        },{
          'dst' : false,
          'offset' : 14400,
          'timezone_id' : 'Asia/Yerevan'
        }
      ],
      'ypt' :
      [
        {'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Dawson'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Whitehorse'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Yakutat'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'Canada/Yukon'
        }
      ],
      'yst' :
      [
        {'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'America/Anchorage'
        },{
          'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'America/Dawson'
        },{
          'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'America/Juneau'
        },{
          'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'America/Nome'
        },{
          'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'America/Whitehorse'
        },{
          'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'America/Yakutat'
        },{
          'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'Canada/Yukon'
        },{
          'dst' : false,
          'offset' : -32400,
          'timezone_id' : 'US/Alaska'
        }
      ],
      'ywt' :
      [
        {'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Dawson'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Whitehorse'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'America/Yakutat'
        },{
          'dst' : true,
          'offset' : -28800,
          'timezone_id' : 'Canada/Yukon'
        }
      ],
      'a' :
      [
        {'dst' : false,
          'offset' : 3600,
          'timezone_id' : null
        },
      ],
      'b' :
      [
        {'dst' : false,
          'offset' : 7200,
          'timezone_id' : null
        },
      ],
      'c' :
      [
        {'dst' : false,
          'offset' : 10800,
          'timezone_id' : null
        },
      ],
      'd' :
      [
        {'dst' : false,
          'offset' : 14400,
          'timezone_id' : null
        },
      ],
      'e' :
      [
        {'dst' : false,
          'offset' : 18000,
          'timezone_id' : null
        },
      ],
      'f' :
      [
        {'dst' : false,
          'offset' : 21600,
          'timezone_id' : null
        },
      ],
      'g' :
      [
        {'dst' : false,
          'offset' : 25200,
          'timezone_id' : null
        },
      ],
      'h' :
      [
        {'dst' : false,
          'offset' : 28800,
          'timezone_id' : null
        },
      ],
      'i' :
      [
        {'dst' : false,
          'offset' : 32400,
          'timezone_id' : null
        },
      ],
      'k' :
      [
        {'dst' : false,
          'offset' : 36000,
          'timezone_id' : null
        },
      ],
      'l' :
      [
        {'dst' : false,
          'offset' : 39600,
          'timezone_id' : null
        },
      ],
      'm' :
      [
        {'dst' : false,
          'offset' : 43200,
          'timezone_id' : null
        },
      ],
      'n' :
      [
        {'dst' : false,
          'offset' : -3600,
          'timezone_id' : null
        },
      ],
      'o' :
      [
        {'dst' : false,
          'offset' : -7200,
          'timezone_id' : null
        },
      ],
      'p' :
      [
        {'dst' : false,
          'offset' : -10800,
          'timezone_id' : null
        },
      ],
      'q' :
      [
        {'dst' : false,
          'offset' : -14400,
          'timezone_id' : null
        },
      ],
      'r' :
      [
        {'dst' : false,
          'offset' : -18000,
          'timezone_id' : null
        },
      ],
      's' :
      [
        {'dst' : false,
          'offset' : -21600,
          'timezone_id' : null
        },
      ],
      't' :
      [
        {'dst' : false,
          'offset' : -25200,
          'timezone_id' : null
        },
      ],
      'utc' :
      [
        {'dst' : false,
          'offset' : 0,
          'timezone_id' : 'UTC'
        }
      ],
      'u' :
      [
        {'dst' : false,
          'offset' : -28800,
          'timezone_id' : null
        },
      ],
      'v' :
      [
        {'dst' : false,
          'offset' : -32400,
          'timezone_id' : null
        },
      ],
      'w' :
      [
        {'dst' : false,
          'offset' : -36000,
          'timezone_id' : null
        },
      ],
      'x' :
      [
        {'dst' : false,
          'offset' : -39600,
          'timezone_id' : null
        },
      ],
      'y' :
      [
        {'dst' : false,
          'offset' : -43200,
          'timezone_id' : null
        },
      ],
      'zzz' :
      [
        {'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Antarctica/Davis'
        },{
          'dst' : false,
          'offset' : 0,
          'timezone_id' : 'Antarctica/DumontDUrville'
        }
      ],
      'z' :
      [
        {'dst' : false,
          'offset' : 0,
          'timezone_id' : null
        },
      ]
    };

    return timezone_abbreviations;
}// }}}

// {{{ basename
function basename(path, suffix) {
    // Returns filename component of path
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_basename/
    // +       version: 811.1414
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Ash Searle (http://hexmen.com/blog/)
    // +   improved by: Lincoln Ramsay
    // +   improved by: djmix
    // *     example 1: basename('/www/site/home.htm', '.htm');
    // *     returns 1: 'home'

    var b = path.replace(/^.*[\/\\]/g, '');
    
    if (typeof(suffix) == 'string' && b.substr(b.length-suffix.length) == suffix) {
        b = b.substr(0, b.length-suffix.length);
    }
    
    return b;
}// }}}

// {{{ dirname
function dirname(path) {
    // Returns directory name component of path
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_dirname/
    // +       version: 809.522
    // +   original by: Ozh
    // +   improved by: XoraX (http://www.xorax.info)
    // *     example 1: dirname('/etc/passwd');
    // *     returns 1: '/etc'
    // *     example 2: dirname('c:/Temp/x');
    // *     returns 2: 'c:/Temp'
    // *     example 3: dirname('/dir/test/');
    // *     returns 3: '/dir'
    
    return path.replace(/\\/g,'/').replace(/\/[^\/]*\/?$/, '');
}// }}}

// {{{ file
function file( url ) {
    // Reads entire file into an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_file/
    // +       version: 811.1812
    // +   original by: Legaev Andrey
    // +      input by: Jani Hartikainen
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // %        note 1: This function uses XmlHttpRequest and cannot retrieve resource from different domain.
    // %        note 1: Synchronous so may lock up browser, mainly here for study purposes.
    // %        note 1: To avoid browser blocking issues's consider using jQuery's: $('#divId').load('http://url') instead.
    // *     example 1: file('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
    // *     returns 1: {0: '123'}

    var req = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
    if (!req) throw new Error('XMLHttpRequest not supported');
       
    req.open("GET", url, false);
    req.send(null);
    
    return req.responseText.split('\n');
}// }}}

// {{{ file_exists
function file_exists (url) {
    // Checks whether a file or directory exists
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_file_exists/
    // +       version: 812.311
    // +   original by: Enrique Gonzalez
    // +      input by: Jani Hartikainen
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // %        note 1: This function uses XmlHttpRequest and cannot retrieve resource from different domain.
    // %        note 1: Synchronous so may lock up browser, mainly here for study purposes. 
    // *     example 1: file_exists('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
    // *     returns 1: '123'
    
    var req = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
    if (!req) throw new Error('XMLHttpRequest not supported');
      
    // HEAD Results are usually shorter (faster) than GET
    req.open('HEAD', url, false);
    req.send(null);
    if (req.status == 200){
        return true;
    }
    
    return false;
}// }}}

// {{{ file_get_contents
function file_get_contents( url ) {
    // Reads entire file into a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_file_get_contents/
    // +       version: 811.1812
    // +   original by: Legaev Andrey
    // +      input by: Jani Hartikainen
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // %        note 1: This function uses XmlHttpRequest and cannot retrieve resource from different domain.
    // %        note 1: Synchronous so may lock up browser, mainly here for study purposes. 
    // %        note 1: To avoid browser blocking issues's consider using jQuery's: $('#divId').load('http://url') instead.
    // *     example 1: file_get_contents('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
    // *     returns 1: '123'

    var req = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
    if (!req) throw new Error('XMLHttpRequest not supported');
    
    req.open("GET", url, false);
    req.send(null);
    
    return req.responseText;
}// }}}

// {{{ filesize
function filesize (url) {
    // Gets file size
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_filesize/
    // +       version: 812.1017
    // +   original by: Enrique Gonzalez
    // +      input by: Jani Hartikainen
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: T. Wild
    // %        note 1: This function uses XmlHttpRequest and cannot retrieve resource from different domain.
    // %        note 1: Synchronous so may lock up browser, mainly here for study purposes. 
    // *     example 1: filesize('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
    // *     returns 1: '3'

    var req = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
    if (!req) throw new Error('XMLHttpRequest not supported');
    
    req.open ('HEAD', url, false);
    req.send (null);
    
    if (!req.getResponseHeader) {
        try {
            throw new Error('No getResponseHeader!');
        } catch(e){
            return false;
        }
    } else if (!req.getResponseHeader('Content-Length')) {
        try {
            throw new Error('No Content-Length!');
        } catch(e){
            return false;
        }
    } else {
        return req.getResponseHeader('Content-Length'); 
    }
}// }}}

// {{{ pathinfo
function pathinfo (path, options) {
    // +   original by: Nate
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // %        note 1: Inspired by actual PHP source: php5-5.2.6/ext/standard/string.c line #1559
    // %        note 1: The way the bitwise arguments are handled allows for greater flexibility
    // %        note 1: & compatability. We might even standardize this code and use a similar approach for
    // %        note 1: other bitwise PHP functions
    // %        note 2: PHP.JS tries to stay away from a core.js file with global dependencies, because we like
    // %        note 2: that you can just take a couple of functions.
    // %        note 2: But by way we implemented this function, you can always declare the PATHINFO_*
    // %        note 2: constants in your scope, and then you can use: pathinfo('/www/index.html', PATHINFO_BASENAME | PATHINFO_EXTENSION);
    // %        note 2: which makes it fully compliant with PHP syntax.
    // -    depends on: dirname
    // -    depends on: basename
    // *     example 1: pathinfo('/www/htdocs/index.html', 1);
    // *     returns 1: '/www/htdocs'
    // *     example 2: pathinfo('/www/htdocs/index.html', 'PATHINFO_BASENAME');
    // *     returns 2: 'index.html'
    // *     example 3: pathinfo('/www/htdocs/index.html', 'PATHINFO_EXTENSION');
    // *     returns 3: 'html'
    // *     example 4: pathinfo('/www/htdocs/index.html', 'PATHINFO_FILENAME');
    // *     returns 4: 'index'
    // *     example 5: pathinfo('/www/htdocs/index.html', 2 | 4);
    // *     returns 5: {basename: 'index.html', extension: 'html'}
    // *     example 6: pathinfo('/www/htdocs/index.html', 'PATHINFO_ALL');
    // *     returns 6: {dirname: '/www/htdocs', basename: 'index.html', extension: 'html', filename: 'index'}
    // *     example 7: pathinfo('/www/htdocs/index.html');
    // *     returns 7: {dirname: '/www/htdocs', basename: 'index.html', extension: 'html', filename: 'index'}

    // Working vars
    var key = '', tmp_arr = {}, cnt = 0;
    var have_basename = false, have_extension = false, have_filename = false;
    
    // Init binary arguments
    var def = {
        'PATHINFO_DIRNAME': 1,
        'PATHINFO_BASENAME': 2,
        'PATHINFO_EXTENSION': 4,
        'PATHINFO_FILENAME': 8,
        'PATHINFO_ALL': 0
    };
    for (key in def) {
        def['PATHINFO_ALL'] = def['PATHINFO_ALL'] | def[key];
    }

    // Input defaulting & sanitation
    if (!path)    return false;
    if (!options) options = 'PATHINFO_ALL';

    // Resolve string input to bitwise e.g. 'PATHINFO_DIRNAME' => 1
    if (def[options]) {
        options = def[options];
    }

    // Internal Functions
    var __getExt = function(path) {
        var str  = path+'';
        var dotP = str.lastIndexOf('.')+1;
        return str.substr(dotP);
    }


    // Gather path infos
    if ((options & def['PATHINFO_DIRNAME']) == def['PATHINFO_DIRNAME']) {
        tmp_arr['dirname'] = dirname(path);
    }

    if ((options & def['PATHINFO_BASENAME']) == def['PATHINFO_BASENAME']) {
        if (false === have_basename) {
            have_basename = basename(path);
        }
        tmp_arr['basename'] = have_basename;
    }

    if ((options & def['PATHINFO_EXTENSION']) == def['PATHINFO_EXTENSION']) {
        if (false === have_basename) {
            have_basename = basename(path);
        }
        if (false === have_extension) {
            have_extension = __getExt(have_basename);
        }
        tmp_arr['extension'] = have_extension;
    }
    
    if ((options & def['PATHINFO_FILENAME']) == def['PATHINFO_FILENAME']) {
        if (false === have_basename) {
            have_basename = basename(path);
        }
        if (false === have_extension) {
            have_extension = __getExt(have_basename);
        }
        if (false === have_filename) {
            have_filename  = have_basename.substr(0, (have_basename.length - have_extension.length)-1);
        }

        tmp_arr['filename'] = have_filename;
    }


    // If array contains only 1 element: return string
    cnt = 0;
    for (key in tmp_arr){
        cnt++;
    }
    if (cnt == 1) {
        return tmp_arr[key];
    }

    // Return full-blown array
    return tmp_arr;
}// }}}

// {{{ call_user_func
function call_user_func(cb, parameters) {
    // Call a user function given by the first parameter
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_call_user_func/
    // +       version: 812.3015
    // +   original by: Brett Zamir
    // *     example 1: call_user_func('isNaN', 'a');
    // *     returns 1: true

    var func;
 
    if (typeof cb == 'string') {
        if (typeof this[cb] == 'function') {
            func = this[cb];
        } else {
            func = (new Function(null, 'return ' + cb))();
        }
    } else if (cb instanceof Array) {
        func = eval(cb[0]+"['"+cb[1]+"']");
    }
    
    if (typeof func != 'function') {
        throw new Exception(func + ' is not a valid function');
    }

    return func.apply(null, Array.prototype.slice.call(parameters, 1));
}// }}}

// {{{ call_user_func_array
function call_user_func_array(cb, parameters) {
    // Call a user function given with an array of parameters
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_call_user_func_array/
    // +       version: 812.3015
    // +   original by: Thiago Mata (http://thiagomata.blog.com)
    // +   revised  by: Jon Hohle
    // +   improved by: Brett Zamir
    // *     example 1: call_user_func_array('isNaN', ['a']);
    // *     returns 1: true
    // *     example 2: call_user_func_array('isNaN', [1]);
    // *     returns 2: false

    var func;

    if (typeof cb == 'string') {
        if (typeof this[cb] == 'function') {
            func = this[cb];
        } else {
            func = (new Function(null, 'return ' + cb))();
        }
    } else if (cb instanceof Array) {
        func = eval(cb[0]+"['"+cb[1]+"']");
    }
    
    if (typeof func != 'function') {
        throw new Exception(func + ' is not a valid function');
    }

    return func.apply(null, parameters);
}// }}}

// {{{ create_function
function create_function (args, code) {
    // Create an anonymous (lambda-style) function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_create_function/
    // +       version: 809.522
    // +   original by: Johnny Mast (http://www.phpvrouwen.nl)
    // *     example 1: f = create_function('a, b', "return (a + b);");
    // *     example 1: f(1, 2);
    // *     returns 1: 3
    
    eval('var _oFunctionObject = function (' + args + ') { ' +  code + '}');
    return _oFunctionObject;
}// }}}

// {{{ func_get_arg
function func_get_arg(num) {
    // Return an item from the argument list
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_func_get_arg/
    // +       version: 812.1714
    // +   original by: Brett Zamir
    // %        note 1: May not work in all JS implementations
    // *     example 1: function tmp_a() {return func_get_arg(1);}
    // *     example 1: tmp_a('a', 'b');
    // *     returns 1: 'a'

    if (!arguments.callee.caller) {
        try {
            throw new Error('Either you are using this in a browser which does not support the "caller" property or you are calling this from a global context');
            return false;
        } catch(e){
            return false;
        }
    }

    if (num > arguments.callee.caller.arguments.length - 1) {
        try {
            throw new Error('Argument number is greater than the number of arguments actually passed');
            return false;
        } catch(e){
            return false;
        }
    }

    return arguments.callee.caller.arguments[num];
}// }}}

// {{{ func_get_args
function func_get_args() {
    // Returns an array comprising a function&#039;s argument list
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_func_get_args/
    // +       version: 812.1714
    // +   original by: Brett Zamir
    // %        note 1: May not work in all JS implementations
    // *     example 1: function tmp_a() {return func_get_args();}
    // *     example 1: tmp_a('a', 'b');
    // *     returns 1: ['a', 'b']

    if (!arguments.callee.caller) {
        try {
            throw new Error('Either you are using this in a browser which does not support the "caller" property or you are calling this from a global context');
            return false;
        } catch(e){
            return false;
        }
    }

    return Array.prototype.slice.call(arguments.callee.caller.arguments);
}// }}}

// {{{ func_num_args
function func_num_args() {
    // Returns the number of arguments passed to the function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_func_num_args/
    // +       version: 812.1714
    // +   original by: Brett Zamir
    // %        note 1: May not work in all JS implementations
    // *     example 1: function tmp_a() {return func_num_args();}
    // *     example 1: tmp_a('a', 'b');
    // *     returns 1: 2

    if (!arguments.callee.caller) {
        try {
            throw new Error('Either you are using this in a browser which does not support the "caller" property or you are calling this from a global context');
            return false;
        } catch(e){
            return false;
        }
    }

    return arguments.callee.caller.arguments.length;
}// }}}

// {{{ function_exists
function function_exists( function_name ) {
    // Return TRUE if the given function has been defined
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_function_exists/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Steve Clay
    // +   improved by: Legaev Andrey
    // *     example 1: function_exists('isFinite');
    // *     returns 1: true


    if (typeof function_name == 'string'){
        return (typeof window[function_name] == 'function');
    } else{
        return (function_name instanceof Function);
    }
}// }}}

// {{{ get_defined_functions
function get_defined_functions() {
    // Returns an array of all defined functions
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_get_defined_functions/
    // +       version: 812.3015
    // +   original by: Brett Zamir
    // +   improved by: Brett Zamir
    // %        note 1: Test case 1: If get_defined_functions can find itself in the defined functions, it worked :)
    // *     example 1: function test_in_array(array, p_val) {for(var i = 0, l = array.length; i < l; i++) {if(array[i] == p_val) return true;} return false;}
    // *     example 1: funcs = get_defined_functions();
    // *     example 1: found = test_in_array(funcs, 'get_defined_functions');
    // *     results 1: found == true

    var i = '', arr = [], already = {};

    for (i in window) {
        try {
            if (typeof window[i] === 'function') {
                if (!already[i]) {
                    already[i] = 1;
                    arr.push(i);
                }
            }
            else if (typeof window[i] === 'object') {
                for (var j in window[i]) {
                    if (typeof window[j] === 'function' && window[j] && !already[j]) {
                        already[j] = 1;
                        arr.push(j);
                    }
                }
            }
        }
        catch (e) {

        }
    }

    return arr;
}// }}}

// {{{ get_included_files
function get_included_files() {
    // Returns an array with the names of included or required files
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_get_included_files/
    // +       version: 809.2915
    // +   original by: Michael White (http://getsprink.com)
    // *     example 1: get_included_files();
    // *     returns 1: ['http://kevin.vanzonneveld.net/pj_tester.php']

    var cur_file = {};
    cur_file[window.location.href] = 1;
    if(!this.__php_js) this.__php_js = {};
    if(!this.__php_js.includes) this.__php_js.includes = cur_file;

    var includes = new Array();
    var i = 0;
    for(var key in this.__php_js.includes){
        includes[i] = key;
        i++;
    }

    return includes;
}// }}}

// {{{ json_decode
function json_decode(str_json) {
    // Decodes a JSON string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_json_decode/
    // +       version: 901.2515
    // +      original by: Public Domain (http://www.json.org/json2.js)
    // + reimplemented by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: json_decode('[\n    "e",\n    {\n    "pluribus": "unum"\n}\n]');
    // *     returns 1: ['e', {pluribus: 'unum'}]

    /*
        http://www.JSON.org/json2.js
        2008-11-19
        Public Domain.
        NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
        See http://www.JSON.org/js.html
    */

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var j;
    var text = str_json;

    var walk = function(holder, key) {
        // The walk method is used to recursively walk the resulting structure so
        // that modifications can be made.
        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
            for (k in value) {
                if (Object.hasOwnProperty.call(value, k)) {
                    v = walk(value, k);
                    if (v !== undefined) {
                        value[k] = v;
                    } else {
                        delete value[k];
                    }
                }
            }
        }
        return reviver.call(holder, key, value);
    }

    // Parsing happens in four stages. In the first stage, we replace certain
    // Unicode characters with escape sequences. JavaScript handles many characters
    // incorrectly, either silently deleting them, or treating them as line endings.
    cx.lastIndex = 0;
    if (cx.test(text)) {
        text = text.replace(cx, function (a) {
            return '\\u' +
            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
    }

    // In the second stage, we run the text against regular expressions that look
    // for non-JSON patterns. We are especially concerned with '()' and 'new'
    // because they can cause invocation, and '=' because it can cause mutation.
    // But just to be safe, we want to reject all unexpected forms.

    // We split the second stage into 4 regexp operations in order to work around
    // crippling inefficiencies in IE's and Safari's regexp engines. First we
    // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
    // replace all simple value tokens with ']' characters. Third, we delete all
    // open brackets that follow a colon or comma or that begin the text. Finally,
    // we look to see that the remaining characters are only whitespace or ']' or
    // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
    if (/^[\],:{}\s]*$/.
        test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

        // In the third stage we use the eval function to compile the text into a
        // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
        // in JavaScript: it can begin a block or an object literal. We wrap the text
        // in parens to eliminate the ambiguity.

        j = eval('(' + text + ')');

        // In the optional fourth stage, we recursively walk the new structure, passing
        // each name/value pair to a reviver function for possible transformation.

        return typeof reviver === 'function' ?
        walk({
            '': j
        }, '') : j;
    }

    // If the text is not JSON parseable, then a SyntaxError is thrown.
    throw new SyntaxError('json_decode');
}// }}}

// {{{ json_encode
function json_encode(mixed_val) {
    // Returns the JSON representation of a value
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_json_encode/
    // +       version: 901.2515
    // +      original by: Public Domain (http://www.json.org/json2.js)
    // + reimplemented by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: json_encode(['e', {pluribus: 'unum'}]);
    // *     returns 1: '[\n    "e",\n    {\n    "pluribus": "unum"\n}\n]'

    /*
        http://www.JSON.org/json2.js
        2008-11-19
        Public Domain.
        NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
        See http://www.JSON.org/js.html
    */
    
    var indent;
    var value = mixed_val;
    var i;

    var quote = function (string) {
        var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        var meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };

        escapable.lastIndex = 0;
        return escapable.test(string) ?
        '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
            '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' :
        '"' + string + '"';
    }

    var str = function(key, holder) {
        var gap = '';
        var indent = '    ';
        var i = 0;          // The loop counter.
        var k = '';          // The member key.
        var v = '';          // The member value.
        var length = 0;
        var mind = gap;
        var partial = [];
        var value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.
        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        
        // What happens next depends on the value's type.
        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':
                // JSON numbers must be finite. Encode non-finite numbers as null.
                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':
                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

            case 'object':
                // If the type is 'object', we might be dealing with an object or an array or
                // null.
                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.
                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.
                gap += indent;
                partial = [];

                // Is the value an array?
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.
                    v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                    partial.join(',\n' + gap) + '\n' +
                    mind + ']' :
                    '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // Iterate through all of the keys in the object.
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.
                v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    };

    // Make a fake root object containing our value under the key of ''.
    // Return the result of stringifying the value.
    return str('', {
        '': value
    });
}// }}}

// {{{ include
function include( filename ) {
    // The include() statement includes and evaluates the specified file.
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_include/
    // +       version: 809.2411
    // +   original by: mdsjack (http://www.mdsjack.bo.it)
    // +   improved by: Legaev Andrey
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Michael White (http://getsprink.com)
    // %        note 1: Force Javascript execution to pause until the file is loaded. Usually causes failure if the file never loads. ( Use sparingly! )
    // %        note 2: The included file does not come available until a second script block, so typically use this in the header.
    // *     example 1: include('http://www.phpjs.org/js/phpjs/_supporters/pj_test_supportfile_2.js');
    // *     returns 1: 1

    var js = document.createElement('script');
    js.setAttribute('type', 'text/javascript');
    js.setAttribute('src', filename);
    js.setAttribute('defer', 'defer');
    document.getElementsByTagName('HEAD')[0].appendChild(js);

    // save include state for reference by include_once
    var cur_file = {};
    cur_file[window.location.href] = 1;

    if (!window.php_js) window.php_js = {};
    if (!window.php_js.includes) window.php_js.includes = cur_file;
    if (!window.php_js.includes[filename]) {
        window.php_js.includes[filename] = 1;
    } else {
        window.php_js.includes[filename]++;
    }

    return window.php_js.includes[filename];
}// }}}

// {{{ include_once
function include_once( filename ) {
    // The include_once() statement includes and evaluates the specified file during
    // the execution of the script. This is a behavior similar to the include()
    // statement, with the only difference being that if the code from a file has
    // already been included, it will not be included again.  As the name suggests, it
    // will be included just once.
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_include_once/
    // +       version: 809.2411
    // +   original by: Legaev Andrey
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Michael White (http://getsprink.com)
    // -    depends on: include
    // *     example 1: include_once('http://www.phpjs.org/js/phpjs/_supporters/pj_test_supportfile_2.js');
    // *     returns 1: true

    var cur_file = {};
    cur_file[window.location.href] = 1;

    if (!window.php_js) window.php_js = {};
    if (!window.php_js.includes) window.php_js.includes = cur_file;
    if (!window.php_js.includes[filename]) {
        if(include(filename)){
            return true;
        }
    } else{
        return true;
    }
}// }}}

// {{{ require
function require( filename ) {
    // The require() statement includes and evaluates the specific file.
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_require/
    // +       version: 809.2411
    // +   original by: Michael White (http://getsprink.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // %        note 1: Force Javascript execution to pause until the file is loaded. Usually causes failure if the file never loads. ( Use sparingly! )
    // -    depends on: file_get_contents
    // *     example 1: require('http://www.phpjs.org/js/phpjs/_supporters/pj_test_supportfile_2.js');
    // *     returns 1: 2

    var js_code = file_get_contents(filename);
    var script_block = document.createElement('script');
    script_block.type = 'text/javascript';
    var client_pc = navigator.userAgent.toLowerCase();
    if((client_pc.indexOf("msie") != -1) && (client_pc.indexOf("opera") == -1)) {
        script_block.text = js_code;
    } else {
        script_block.appendChild(document.createTextNode(js_code));
    }

    if(typeof(script_block) != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(script_block);

        // save include state for reference by include_once and require_once()
        var cur_file = {};
        cur_file[window.location.href] = 1;

        if (!window.php_js) window.php_js = {};
        if (!window.php_js.includes) window.php_js.includes = cur_file;

        if (!window.php_js.includes[filename]) {
            window.php_js.includes[filename] = 1;
        } else {
            // Use += 1 because ++ waits until AFTER the original value is returned to increment the value.
            return window.php_js.includes[filename] += 1;
        }
    }
}// }}}

// {{{ require_once
function require_once(filename) {
    // The require_once() statement includes and evaluates the specified file during
    // the execution of the script. This is a behavior similar to the require()
    // statement, with the only difference being that if the code from a file has
    // already been included, it will not be included again.  See the documentation for
    // require() for more information on how this statement works.
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_require_once/
    // +       version: 809.2411
    // +   original by: Michael White (http://getsprink.com)
    // -    depends on: require
    // *     example 1: require_once('http://www.phpjs.org/js/phpjs/_supporters/pj_test_supportfile_2.js');
    // *     returns 1: true

    var cur_file = {};
    cur_file[window.location.href] = 1;

    // save include state for reference by include_once and require_once()
    if (!window.php_js) window.php_js = {};
    if (!window.php_js.includes) window.php_js.includes = cur_file;
    if (!window.php_js.includes[filename]) {
        if (require(filename)) {
            return true;
        }
    } else {
        return true;
    }
}// }}}

// {{{ abs
function abs( mixed_number )  {
    // Absolute value
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_abs/
    // +       version: 811.1314
    // +   original by: Waldo Malqui Silva
    // +   improved by: Karol Kowalski
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // *     example 1: abs(4.2);
    // *     returns 1: 4.2
    // *     example 2: abs(-4.2);
    // *     returns 2: 4.2
    // *     example 3: abs(-5);
    // *     returns 3: 5
    // *     example 4: abs('_argos');
    // *     returns 4: 0

    return Math.abs(mixed_number) || 0;
}// }}}

// {{{ acos
function acos(arg) {
    // Arc cosine
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_acos/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: acos(0.3);
    // *     returns 1: 1.2661036727794992

    return Math.acos(arg);
}// }}}

// {{{ acosh
function acosh(arg) {
    // Inverse hyperbolic cosine
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_acosh/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: acosh(8723321.4);
    // *     returns 1: 16.674657798418625

    return Math.log(arg + Math.sqrt(arg*arg-1));
}// }}}

// {{{ asin
function asin(arg) {
    // Arc sine
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_asin/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: asin(0.3);
    // *     returns 1: 0.3046926540153975

    return Math.asin(arg);
}// }}}

// {{{ asinh
function asinh(arg) {
    // Inverse hyperbolic sine
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_asinh/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: asinh(8723321.4);
    // *     returns 1: 16.67465779841863

    return Math.log(arg + Math.sqrt(arg*arg+1));
}// }}}

// {{{ atan
function atan(arg) {
    // Arc tangent
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_atan/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: atan(8723321.4);
    // *     returns 1: 1.5707962121596615

    return Math.atan(arg);
}// }}}

// {{{ atanh
function atanh(arg) {
    // Inverse hyperbolic tangent
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_atanh/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: atanh(0.3);
    // *     returns 1: 0.3095196042031118

    return 0.5 * Math.log((1+arg)/(1-arg));
}// }}}

// {{{ base_convert
function base_convert(number, frombase, tobase) {
    // Convert a number between arbitrary bases
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_base_convert/
    // +       version: 810.612
    // +   original by: Philippe Baumann
    // *     example 1: base_convert('A37334', 16, 2);
    // *     returns 1: '101000110111001100110100'

    return parseInt(number+'', frombase+0).toString(tobase+0);
}// }}}

// {{{ bindec
function bindec (binary_string) {
    // Binary to decimal
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_bindec/
    // +       version: 810.612
    // +   original by: Philippe Baumann
    // *     example 1: bindec('110011');
    // *     returns 1: 51
    // *     example 2: bindec('000110011');
    // *     returns 2: 51
    // *     example 3: bindec('111');
    // *     returns 3: 7

    binary_string = (binary_string+'').replace(/[^01]/gi, '');
    return parseInt(binary_string, 2);
}// }}}

// {{{ ceil
function ceil(value) {
    // Round fractions up
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_ceil/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: ceil(8723321.4);
    // *     returns 1: 8723322

    return Math.ceil(value);
}// }}}

// {{{ cos
function cos(arg) {
    // Cosine
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_cos/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: cos(8723321.4);
    // *     returns 1: -0.18127180117607017

    return Math.cos(arg);
}// }}}

// {{{ cosh
function cosh(arg) {
    // Hyperbolic cosine
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_cosh/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: cosh(-0.18127180117607017);
    // *     returns 1: 1.0164747716114113

    return (Math.exp(arg) + Math.exp(-arg))/2;
}// }}}

// {{{ decbin
function decbin(number) {
    // Decimal to binary
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_decbin/
    // +       version: 811.1314
    // +   original by: Enrique Gonzalez
    // +   bugfixed by: Onno Marsman
    // *     example 1: decbin(12);
    // *     returns 1: '1100'
    // *     example 2: decbin(26);
    // *     returns 2: '11010'
    // *     example 3: decbin('26');
    // *     returns 3: '11010'
    
    return parseInt(number).toString(2);
}// }}}

// {{{ dechex
function dechex(number) {
    // Decimal to hexadecimal
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_dechex/
    // +       version: 810.612
    // +   original by: Philippe Baumann
    // +   bugfixed by: Onno Marsman
    // *     example 1: dechex(10);
    // *     returns 1: 'a'
    // *     example 2: dechex(47);
    // *     returns 2: '2f'
    
    return parseInt(number).toString(16);
}// }}}

// {{{ decoct
function decoct(number) {
    // Decimal to octal
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_decoct/
    // +       version: 810.612
    // +   original by: Enrique Gonzalez
    // +   bugfixed by: Onno Marsman
    // *     example 1: decoct(15);
    // *     returns 1: '17'
    // *     example 2: decoct(264); 
    // *     returns 2: '410'
    
    return parseInt(number).toString(8);
}// }}}

// {{{ deg2rad
function deg2rad(angle) {
    // Converts the number in degrees to the radian equivalent
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_deg2rad/
    // +       version: 810.115
    // +   original by: Enrique Gonzalez
    // *     example 1: deg2rad(45);
    // *     returns 1: 0.7853981633974483
    
    return (angle/180)*Math.PI;
}// }}}

// {{{ exp
function exp(arg) {
    // Calculates the exponent of e
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_exp/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: exp(0.3);
    // *     returns 1: 1.3498588075760032

    return Math.exp(arg);
}// }}}

// {{{ floor
function floor(value) {
    // Round fractions down
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_floor/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: floor(8723321.4);
    // *     returns 1: 8723321
    
    return Math.floor(value);
}// }}}

// {{{ fmod
function fmod(x, y) {
    // Returns the floating point remainder (modulo) of the division  of the arguments
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_fmod/
    // +       version: 810.612
    // +   original by: Onno Marsman
    // *     example 1: fmod(5.7, 1.3);
    // *     returns 1: 0.5
    
    var tmp, tmp2, p = 0, pY = 0, l = 0.0, l2 = 0.0;
    
    tmp = x.toExponential().match(/^.\.?(.*)e(.+)$/);
    p = parseInt(tmp[2])-(tmp[1]+'').length;
    tmp = y.toExponential().match(/^.\.?(.*)e(.+)$/);
    pY = parseInt(tmp[2])-(tmp[1]+'').length;
    
    if (pY > p) {
        p = pY;
    }
    
    tmp2 = (x%y);
    
    if (p < -100 || p > 20) {
        // toFixed will give an out of bound error so we fix it like this:
        var l = Math.round(Math.log(tmp2)/Math.log(10));
        var l2 = Math.pow(10, l);
        
        return (tmp2/l2).toFixed(l-p)*l2;
    } else {
        return parseFloat(tmp2.toFixed(-p));
    }
}// }}}

// {{{ getrandmax
function getrandmax()
{
    // Show largest possible random value
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_getrandmax/
    // +       version: 810.915
    // +   original by: Onno Marsman
    // *     example 1: getrandmax();
    // *     returns 1: 2147483647
    return 2147483647;
}// }}}

// {{{ hexdec
function hexdec(hex_string) {
    // Hexadecimal to decimal
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_hexdec/
    // +       version: 810.300
    // +   original by: Philippe Baumann
    // *     example 1: hexdec('that');
    // *     returns 1: 10
    // *     example 2: hexdec('a0');
    // *     returns 2: 160
    
    hex_string = (hex_string+'').replace(/[^a-f0-9]/gi, '');
    return parseInt(hex_string, 16);
}// }}}

// {{{ hypot
function hypot(x, y) {
    // Calculate the length of the hypotenuse of a right-angle triangle
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_hypot/
    // +       version: 810.819
    // +   original by: Onno Marsman
    // *     example 1: hypot(3, 4);
    // *     returns 1: 5
    // *     example 2: hypot([], 'a');
    // *     returns 2: 0

    return Math.sqrt(x*x + y*y) || 0;
}// }}}

// {{{ is_finite
function is_finite(val) {
    // Finds whether a value is a legal finite number
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_finite/
    // +       version: 810.1310
    // +   original by: Onno Marsman
    // *     example 1: is_finite(Infinity);
    // *     returns 1: false
    // *     example 2: is_finite(-Infinity);
    // *     returns 2: false
    // *     example 3: is_finite(0);
    // *     returns 3: true

    var warningType = '';

    if (val===Infinity || val===-Infinity) {
        return false;
    }

    //Some warnings for maximum PHP compatibility
    if (typeof val=='object') {
        warningType = (val instanceof Array ? 'array' : 'object');
    } else if (typeof val=='string' && !val.match(/^[\+\-]?\d/)) {
        //simulate PHP's behaviour: '-9a' doesn't give a warning, but 'a9' does.
        warningType = 'string';
    }
    if (warningType) {
        throw new Error('Warning: is_finite() expects parameter 1 to be double, '+warningType+' given');
    }

    return true;
}// }}}

// {{{ is_infinite
function is_infinite(val) {
    // Finds whether a value is infinite
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_infinite/
    // +       version: 810.1310
    // +   original by: Onno Marsman
    // *     example 1: is_infinite(Infinity);
    // *     returns 1: true
    // *     example 2: is_infinite(-Infinity);
    // *     returns 2: true
    // *     example 3: is_infinite(0);
    // *     returns 3: false

    var warningType = '';

    if (val===Infinity || val===-Infinity) {
        return true;
    }

    //Some warnings for maximum PHP compatibility
    if (typeof val=='object') {
        warningType = (val instanceof Array ? 'array' : 'object');
    } else if (typeof val=='string' && !val.match(/^[\+\-]?\d/)) {
        //simulate PHP's behaviour: '-9a' doesn't give a warning, but 'a9' does.
        warningType = 'string';
    }
    if (warningType) {
        throw new Error('Warning: is_infinite() expects parameter 1 to be double, '+warningType+' given');
    }

    return false;
}// }}}

// {{{ is_nan
function is_nan(val) {
    // Finds whether a value is not a number
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_nan/
    // +       version: 810.1310
    // +   original by: Onno Marsman
    // +      input by: Robin
    // *     example 1: is_nan(NaN);
    // *     returns 1: true
    // *     example 2: is_nan(0);
    // *     returns 2: false

    var warningType = '';

    if (typeof val=='number' && isNaN(val)) {
        return true;
    }

    //Some errors for maximum PHP compatibility
    if (typeof val=='object') {
        warningType = (val instanceof Array ? 'array' : 'object');
    } else if (typeof val=='string' && !val.match(/^[\+\-]?\d/)) {
        //simulate PHP's behaviour: '-9a' doesn't give a warning, but 'a9' does.
        warningType = 'string';
    }
    if (warningType) {
        throw new Error('Warning: is_nan() expects parameter 1 to be double, '+warningType+' given');
    }

    return false;
}// }}}

// {{{ lcg_value
function lcg_value() {
    // Combined linear congruential generator
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_lcg_value/
    // +       version: 810.819
    // +   original by: Onno Marsman

    return Math.random();
}// }}}

// {{{ log
function log(arg, base) {
    // Natural logarithm
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_log/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: log(8723321.4, 7);
    // *     returns 1: 8.212871815082147

    if (base === undefined) {
        return Math.log(arg);
    } else {
        return Math.log(arg)/Math.log(base);
    }
}// }}}

// {{{ log10
function log10(arg) {
    // Base-10 logarithm
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_log10/
    // +       version: 811.1323
    // +   original by: Philip Peterson
    // +   improved by: Onno Marsman
    // +   improved by: Tod Gentille
    // *     example 1: log10(10);
    // *     returns 1: 1
    // *     example 2: log10(1);
    // *     returns 2: 0

    return Math.log(arg)/Math.LN10;
}// }}}

// {{{ max
function max() {
    // Find highest value
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_max/
    // +       version: 810.112
    // +   original by: Onno Marsman
    // +    revised by: Onno Marsman
    // +    tweaked by: Jack
    // %          note: Long code cause we're aiming for maximum PHP compatibility
    // *     example 1: max(1, 3, 5, 6, 7);
    // *     returns 1: 7
    // *     example 2: max([2, 4, 5]);
    // *     returns 2: 5
    // *     example 3: max(0, 'hello');
    // *     returns 3: 0
    // *     example 4: max('hello', 0);
    // *     returns 4: 'hello'
    // *     example 5: max(-1, 'hello');
    // *     returns 5: 'hello'
    // *     example 6: max([2, 4, 8], [2, 5, 7]);
    // *     returns 6: [2, 5, 7]

    var ar, retVal, i = 0, n = 0;
    var argv = arguments, argc = argv.length;

    var _obj2Array = function(obj) {
        if (obj instanceof Array) {
            return obj;
        } else {
            var ar = [];
            for (var i in obj) {
                ar.push(obj[i]);
            }
            return ar;
        }
    } //function _obj2Array
    
    var _compare = function(current, next) {
        var i = 0, n = 0, tmp = 0;
        var nl = 0, cl = 0;
        
        if (current === next) {
            return 0;
        } else if (typeof current == 'object') {
            if (typeof next == 'object') {
               current = _obj2Array(current);
               next    = _obj2Array(next);
               cl      = current.length;
               nl      = next.length;
               if (nl > cl) {
                   return 1;
               } else if (nl < cl) {
                   return -1;
               } else {
                   for (i = 0, n = cl; i<n; ++i) {
                       tmp = _compare(current[i], next[i]);
                       if (tmp == 1) {
                           return 1;
                       } else if (tmp == -1) {
                           return -1;
                       }
                   }
                   return 0;
               }
            } else {
               return -1;
            }
        } else if (typeof next == 'object') {
            return 1;
        } else if (isNaN(next) && !isNaN(current)) {
            if (current == 0) {
               return 0;
            } else {
               return (current<0 ? 1 : -1);
            }
        } else if (isNaN(current) && !isNaN(next)) {
            if (next==0) {
               return 0;
            } else {
               return (next>0 ? 1 : -1);
            }
        } else {
            if (next==current) {
               return 0;
            } else {
               return (next>current ? 1 : -1);
            }
        }
    } //function _compare
    
    if (argc == 0) {
        throw new Error('At least one value should be passed to max()');
    } else if (argc == 1) {
        if (typeof argv[0]=='object') {
            ar = _obj2Array(argv[0]);
        } else {
            throw new Error('Wrong parameter count for max()');
        }
        if (ar.length == 0) {
            throw new Error('Array must contain at least one element for max()');
        }
    } else {
        ar = argv;
    }
    
    retVal = ar[0];
    for (i=1, n=ar.length; i<n; ++i) {
        if (_compare(retVal, ar[i])==1) {
            retVal = ar[i];
        }
    }
    
    return retVal;
}// }}}

// {{{ min
function min() {
    // Find lowest value
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_min/
    // +       version: 810.112
    // +   original by: Onno Marsman
    // +    revised by: Onno Marsman
    // +    tweaked by: Jack
    // %          note: Long code cause we're aiming for maximum PHP compatibility
    // *     example 1: min(1, 3, 5, 6, 7);
    // *     returns 1: 1
    // *     example 2: min([2, 4, 5]);
    // *     returns 2: 2
    // *     example 3: min(0, 'hello');
    // *     returns 3: 0
    // *     example 4: min('hello', 0);
    // *     returns 4: 'hello'
    // *     example 5: min(-1, 'hello');
    // *     returns 5: -1
    // *     example 6: min([2, 4, 8], [2, 5, 7]);
    // *     returns 6: [2, 4, 8]
    
    var ar, retVal, i = 0, n = 0;
    var argv = arguments, argc = argv.length;

    var _obj2Array = function(obj) {
        if (obj instanceof Array) {
            return obj;
        } else {
            var ar = [];
            for (var i in obj) {
                ar.push(obj[i]);
            }
            return ar;
        }
    } //function _obj2Array
    
    var _compare = function(current, next) {
        var i = 0, n = 0, tmp = 0;
        var nl = 0, cl = 0;
        
        if (current === next) {
            return 0;
        } else if (typeof current == 'object') {
            if (typeof next == 'object') {
               current = _obj2Array(current);
               next    = _obj2Array(next);
               cl      = current.length;
               nl      = next.length;
               if (nl > cl) {
                   return 1;
               } else if (nl < cl) {
                   return -1;
               } else {
                   for (i = 0, n = cl; i<n; ++i) {
                       tmp = _compare(current[i], next[i]);
                       if (tmp == 1) {
                           return 1;
                       } else if (tmp == -1) {
                           return -1;
                       }
                   }
                   return 0;
               }
            } else {
               return -1;
            }
        } else if (typeof next == 'object') {
            return 1;
        } else if (isNaN(next) && !isNaN(current)) {
            if (current == 0) {
               return 0;
            } else {
               return (current<0 ? 1 : -1);
            }
        } else if (isNaN(current) && !isNaN(next)) {
            if (next==0) {
               return 0;
            } else {
               return (next>0 ? 1 : -1);
            }
        } else {
            if (next==current) {
               return 0;
            } else {
               return (next>current ? 1 : -1);
            }
        }
    } //function _compare
    
    if (argc == 0) {
        throw new Error('At least one value should be passed to min()');
    } else if (argc == 1) {
        if (typeof argv[0]=='object') {
            ar = _obj2Array(argv[0]);
        } else {
            throw new Error('Wrong parameter count for min()');
        }
        if (ar.length == 0) {
            throw new Error('Array must contain at least one element for min()');
        }
    } else {
        ar = argv;
    }
    
    retVal = ar[0];
    for (i=1, n=ar.length; i<n; ++i) {
        if (_compare(retVal, ar[i])==-1) {
            retVal = ar[i];
        }
    }
    
    return retVal;
}// }}}

// {{{ mt_getrandmax
function mt_getrandmax()
{
    // Show largest possible random value
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_mt_getrandmax/
    // +       version: 810.915
    // +   original by: Onno Marsman
    // *     example 1: mt_getrandmax();
    // *     returns 1: 2147483647
    return 2147483647;
}// }}}

// {{{ mt_rand
function mt_rand( min, max ) {
    // Generate a better random value
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_mt_rand/
    // +       version: 810.915
    // +   original by: Onno Marsman
    // *     example 1: mt_rand(1, 1);
    // *     returns 1: 1
    var argc = arguments.length;
    if (argc == 0) {
        min = 0;
        max = 2147483647;
    } else if (argc == 1) {
        throw new Error('Warning: mt_rand() expects exactly 2 parameters, 1 given');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}// }}}

// {{{ octdec
function octdec (oct_string) {
    // Octal to decimal
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_octdec/
    // +       version: 810.612
    // +   original by: Philippe Baumann
    // *     example 1: octdec('77');
    // *     returns 1: 63

    oct_string = (oct_string+'').replace(/[^0-7]/gi, '');
    return parseInt(oct_string, 8);
}// }}}

// {{{ pi
function pi() {
    // Get value of pi
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_pi/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: pi(8723321.4);
    // *     returns 1: 3.141592653589793

    return Math.PI;
}// }}}

// {{{ pow
function pow(base, exp) {
    // Exponential expression
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_pow/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: pow(8723321.4, 7);
    // *     returns 1: 3.843909168077899e+48

    return Math.pow(base, exp);
}// }}}

// {{{ rad2deg
function rad2deg(angle) {
    // Converts the radian number to the equivalent number in degrees
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_rad2deg/
    // +       version: 810.115
    // +   original by: Enrique Gonzalez
    // *     example 1: rad2deg(3.141592653589793);
    // *     returns 1: 180
    
    return (angle/Math.PI) * 180;
}// }}}

// {{{ rand
function rand( min, max ) {
    // Generate a random integer
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_rand/
    // +       version: 810.915
    // +   original by: Leslie Hoare
    // +   bugfixed by: Onno Marsman
    // *     example 1: rand(1, 1);
    // *     returns 1: 1
    var argc = arguments.length;
    if (argc == 0) {
        min = 0;
        max = 2147483647;
    } else if (argc == 1) {
        throw new Error('Warning: rand() expects exactly 2 parameters, 1 given');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}// }}}

// {{{ round
function round ( val, precision ) {
    // Rounds a float
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_round/
    // +       version: 809.2411
    // +   original by: Philip Peterson
    // +    revised by: Onno Marsman
    // *     example 1: round(1241757, -3);
    // *     returns 1: 1242000
    // *     example 2: round(3.6);
    // *     returns 2: 4
 
    return parseFloat(parseFloat(val).toFixed(precision));
}// }}}

// {{{ sin
function sin(arg) {
    // Sine
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_sin/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: sin(8723321.4);
    // *     returns 1: -0.9834330348825909

    return Math.sin(arg);
}// }}}

// {{{ sinh
function sinh(arg) {
    // Hyperbolic sine
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_sinh/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: sinh(-0.9834330348825909);
    // *     returns 1: -1.1497971402636502

    return (Math.exp(arg) - Math.exp(-arg))/2;
}// }}}

// {{{ sqrt
function sqrt(arg) {
    // Square root
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_sqrt/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: sqrt(8723321.4);
    // *     returns 1: 2953.5269424875746
    
    return Math.sqrt(arg);
}// }}}

// {{{ tan
function tan(arg) {
    // Tangent
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_tan/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: tan(8723321.4);
    // *     returns 1: 5.4251848798444815

    return Math.tan(arg);
}// }}}

// {{{ tanh
function tanh(arg) {
    // Hyperbolic tangent
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_tanh/
    // +       version: 809.2411
    // +   original by: Onno Marsman
    // *     example 1: tanh(5.4251848798444815);
    // *     returns 1: 0.9999612058841574

    return (Math.exp(arg) - Math.exp(-arg)) / (Math.exp(arg) + Math.exp(-arg));
}// }}}

// {{{ constant
function constant(name) {
    // Returns the value of a constant
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_constant/
    // +       version: 812.311
    // +   original by: Paulo Ricardo F. Santos
    // *     example 1: constant('IMAGINARY_CONSTANT1');
    // *     returns 1: null

    if (window[name] === undefined) {
        return null;
    }

    return window[name];
}// }}}

// {{{ define
function define(name, value) {
    // Defines a named constant
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_define/
    // +       version: 812.311
    // +   original by: Paulo Ricardo F. Santos
    // *     example 1: define('IMAGINARY_CONSTANT1', 'imaginary_value1');
    // *     returns 1: true
    
    if (/boolean|number|null|string/.test(typeof value) !== true) {
        return false;
    }
    
    return (window[name] = value) !== undefined;
}// }}}

// {{{ defined
function defined( constant_name )  {
    // Checks whether a given named constant exists
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_defined/
    // +       version: 901.2514
    // +   original by: Waldo Malqui Silva
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Brett Zamir
    // *     example 1: defined('IMAGINARY_CONSTANT1');
    // *     returns 1: false

    var tmp = window[constant];
    
    window[constant] = window[constant] ? 'changed'+window[constant].toString() : 'changed';
    var returnval = window[constant] === tmp;
    if (!returnval) { // Reset
        window[constant] = tmp;
    }

    return returnval;
}// }}}

// {{{ die
function die( status ) {
    // Equivalent to exit()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_die/
    // +       version: 901.617
    // +   original by: Brett Zamir
    //  -   depends on: exit
    // %        note 1: Should be considered expirimental. Please comment on this function.
    // *     example 1: die();
    // *     returns 1: null

    return exit(status);
}// }}}

// {{{ exit
function exit( status ) {
    // Output a message and terminate the current script
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_exit/
    // +       version: 901.1520
    // +   original by: Brett Zamir
    // +      input by: Paul
    // +   bugfixed by: Hyam Singer (http://www.impact-computing.com/)
    // %        note 1: Should be considered expirimental. Please comment on this function.
    // *     example 1: exit();
    // *     returns 1: null

    var i;

    if (typeof status === 'string') {
        alert(status);
    }

    window.addEventListener('error', function (e) {e.preventDefault();e.stopPropagation();}, false);

    var handlers = [
        'copy', 'cut', 'paste',
        'beforeunload', 'blur', 'change', 'click', 'contextmenu', 'dblclick', 'focus', 'keydown', 'keypress', 'keyup', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'resize', 'scroll',
        'DOMNodeInserted', 'DOMNodeRemoved', 'DOMNodeRemovedFromDocument', 'DOMNodeInsertedIntoDocument', 'DOMAttrModified', 'DOMCharacterDataModified', 'DOMElementNameChanged', 'DOMAttributeNameChanged', 'DOMActivate', 'DOMFocusIn', 'DOMFocusOut', 'online', 'offline', 'textInput',
        'abort', 'close', 'dragdrop', 'load', 'paint', 'reset', 'select', 'submit', 'unload'
    ];
    
    function stopPropagation (e) {
        e.stopPropagation();
        // e.preventDefault(); // Stop for the form controls, etc., too?
    }
    for (i=0; i < handlers.length; i++) {
        window.addEventListener(handlers[i], function (e) {e.stopPropagation();}, true);
    }
    
    throw '';
}// }}}

// {{{ php_strip_whitespace
function php_strip_whitespace (file) {
    // Return source with stripped comments and whitespace
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_php_strip_whitespace/
    // +       version: 901.2514
    // +   original by: Brett Zamir
    // %        note 1: This function uses XmlHttpRequest and cannot retrieve resource from different domain.
    // %        note 1: Synchronous so may lock up browser, mainly here for study purposes.
    // %        note 1: To avoid browser blocking issues's consider using jQuery's: $('#divId').load('http://url') instead.
    // -    depends on: file_get_contents
    // *     example 1: php_strip_whitespace('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
    // *     returns 1: '123'

    try {
        var str = file_get_contents(file);
    } catch (e) {
        return '';
    }
    // Strip comments (both styles), reduce non-newline whitespace to one, reduce multiple
    // newlines (preceded by any whitespace) to a newline, remove WS at beginning of line,
    // and at end of line
    return str.replace(/\/\/.*?\n/g, '').replace(/\/\*[^]*?\*\//g, '').replace(/[ \f\r\t\v\u00A0\u2028\u2029]+/g, ' ').replace(/\s*\n+/g, '\n').replace(/^\s+/gm, '').replace(/\s*$/gm, '');
}// }}}

// {{{ sleep
function sleep(seconds) {
    // Delay execution
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_sleep/
    // +       version: 901.2514
    // +   original by: Christian Doebler
    // +   bugfixed by: Brett Zamir
    // %          note: For study purposes. Current implementation could lock up the user's browser. 
    // %          note: Consider using setTimeout() instead.
    // *     example 1: sleep(1);
    // *     returns 1: 0
    
    var start = new Date().getTime();
    while (new Date() < start + seconds*1000);
    return 0;
}// }}}

// {{{ time_nanosleep
function time_nanosleep(seconds, nanosecs) {
    // Delay for a number of seconds and nanoseconds
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_time_nanosleep/
    // +       version: 902.122
    // +   original by: Brett Zamir
    // %        note 1: For study purposes. Current implementation could lock up the user's browser.
    // %        note 1: Consider using setTimeout() instead.
    // %        note 2: Note that the following function's argument, contrary to the reference to
    // %        note 2: nanoseconds, does not start being significant until 1,000,000 nanoseconds (milliseconds),
    // %        note 2: since that is the smallest unit handled by JavaScript's Date function.
    // *     example 1: time_nanosleep(1, 2000000000); // delays for 3 seconds
    // *     returns 1: true

    var start = new Date().getTime();
    while (new Date() < (start + seconds*1000+nanosecs/1000000));
    return true;
}// }}}

// {{{ time_sleep_until
function time_sleep_until(timestamp) {
    // Make the script sleep until the specified time
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_time_sleep_until/
    // +       version: 902.210
    // +   original by: Brett Zamir
    // %          note: For study purposes. Current implementation could lock up the user's browser.
    // %          note: Expects a timestamp in seconds, so DO NOT pass in a JavaScript timestamp which are in milliseconds (e.g., new Date()) or otherwise the function will lock up the browser 1000 times longer than probably intended.
    // %          note: Consider using setTimeout() instead.
    // *     example 1: time_sleep_until(1233146501) // delays until the time indicated by the given timestamp is reached
    // *     returns 1: true

    while (new Date() < timestamp*1000);
    return true;
}// }}}

// {{{ usleep
function usleep(microseconds) {
    // #!#!#!#!# usleep::$descr1 does not contain valid 'usleep' at line 260
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_usleep/
    // +       version: 902.122
    // // +   original by: Brett Zamir
    // %        note 1: For study purposes. Current implementation could lock up the user's browser.
    // %        note 1: Consider using setTimeout() instead.
    // %        note 2: Note that this function's argument, contrary to the PHP name, does not
    // %        note 2: start being significant until 1,000 microseconds (1 millisecond)
    // *     example 1: usleep(2000000); // delays for 2 seconds
    // *     returns 1: true

    var start = new Date().getTime();
    while (new Date() < (start + microseconds/1000));
    return true;
}// }}}

// {{{ ip2long
function ip2long ( ip_address ) {
    // Converts a string containing an (IPv4) Internet Protocol dotted address into a
    // proper address
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_ip2long/
    // +       version: 901.714
    // +   original by: Waldo Malqui Silva
    // +   improved by: Victor
    // *     example 1: ip2long( '192.0.34.166' );
    // *     returns 1: 3221234342
    
    var output = false;
    var parts = [];
    if (ip_address.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        parts  = ip_address.split('.');
        output = ( parts[0] * 16777216 +
        ( parts[1] * 65536 ) +
        ( parts[2] * 256 ) +
        ( parts[3] * 1 ) );
    }
     
    return output;
}// }}}

// {{{ long2ip
function long2ip ( proper_address ) {
    // Converts an (IPv4) Internet network address into a string in Internet standard
    // dotted format
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_long2ip/
    // +       version: 811.1314
    // +   original by: Waldo Malqui Silva
    // *     example 1: long2ip( 3221234342 );
    // *     returns 1: '192.0.34.166'
    
    var output = false;
    
    if ( !isNaN ( proper_address ) && ( proper_address >= 0 || proper_address <= 4294967295 ) ) {
		output = Math.floor (proper_address / Math.pow ( 256, 3 ) ) + '.' +
			Math.floor ( ( proper_address % Math.pow ( 256, 3 ) ) / Math.pow ( 256, 2 ) ) + '.' +
			Math.floor ( ( ( proper_address % Math.pow ( 256, 3 ) )  % Math.pow ( 256, 2 ) ) / Math.pow ( 256, 1 ) ) + '.' +
			Math.floor ( ( ( ( proper_address % Math.pow ( 256, 3 ) ) % Math.pow ( 256, 2 ) ) % Math.pow ( 256, 1 ) ) / Math.pow ( 256, 0 ) );
    }
    
    return output;
}// }}}

// {{{ setcookie
function setcookie(name, value, expires, path, domain, secure) {
    // Send a cookie
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_setcookie/
    // +       version: 901.810
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   bugfixed by: Andreas
    // +   bugfixed by: Onno Marsman
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: setrawcookie
    // *     example 1: setcookie('author_name', 'Kevin van Zonneveld');
    // *     returns 1: true

    return setrawcookie(name, encodeURIComponent(value), expires, path, domain, secure)
}// }}}

// {{{ setrawcookie
function setrawcookie(name, value, expires, path, domain, secure) {
    // Send a cookie without urlencoding the cookie value
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_setrawcookie/
    // +       version: 901.810
    // +   original by: Brett Zamir
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: setcookie('author_name', 'Kevin van Zonneveld');
    // *     returns 1: true

    if (expires instanceof Date) {
        expires = expires.toGMTString();
    } else if(typeof(expires) == 'number') {
        expires = (new Date(+(new Date) + expires * 1e3)).toGMTString();
    }

    var r = [name + "=" + value], s, i;
    for(i in s = {expires: expires, path: path, domain: domain}){
        s[i] && r.push(i + "=" + s[i]);
    }
    
    return secure && r.push("secure"), document.cookie = r.join(";"), true;
}// }}}

// {{{ preg_quote
function preg_quote( str ) {
    // Quote regular expression characters
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_preg_quote/
    // +       version: 810.819
    // +   original by: booeyOH
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: preg_quote("$40");
    // *     returns 1: '\$40'
    // *     example 2: preg_quote("*RRRING* Hello?");
    // *     returns 2: '\*RRRING\* Hello\?'
    // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'

    return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
}// }}}

// {{{ addslashes
function addslashes( str ) {
    // Quote string with slashes
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_addslashes/
    // +       version: 809.2122
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +   improved by: marrtins
    // +   improved by: Nate
    // +   improved by: Onno Marsman
    // *     example 1: addslashes("kevin's birthday");
    // *     returns 1: 'kevin\'s birthday'
 
    return (str+'').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
}// }}}

// {{{ bin2hex
function bin2hex(s){
    // Convert binary data into hexadecimal representation
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_bin2hex/
    // +       version: 811.2517
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Linuxworld
    // *     example 1: bin2hex('Kev');
    // *     returns 1: '4b6576'
    // *     example 2: bin2hex(String.fromCharCode(0x00));
    // *     returns 2: '00'

    var v,i, f = 0, a = [];
    s += '';
    f = s.length;
    
    for (i = 0; i<f; i++) {
        a[i] = s.charCodeAt(i).toString(16).replace(/^([\da-f])$/,"0$1");
    }
    
    return a.join('');
}// }}}

// {{{ chop
function chop ( str, charlist ) {
    // Alias of rtrim()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_chop/
    // +       version: 812.1017
    // +   original by: Paulo Ricardo F. Santos
    // -    depends on: rtrim
    // *     example 1: rtrim('    Kevin van Zonneveld    ');
    // *     returns 1: '    Kevin van Zonneveld'

    return rtrim(str, charlist);
}// }}}

// {{{ chr
function chr( ascii ) {
    // Return a specific character
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_chr/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: chr(75);
    // *     returns 1: 'K'

    return String.fromCharCode(ascii);
}// }}}

// {{{ count_chars
function count_chars( str, mode ) {
    // Return information about characters used in a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_count_chars/
    // +       version: 810.621
    // +   original by: Ates Goral (http://magnetiq.com)
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // *     example 1: count_chars("Hello World!", 1);
    // *     returns 1: "Hd e!lWor"

    var histogram = new Object(), tmp_arr = new Array();
    var key, i, code, mode, strl = 0;
    var argc = arguments.length;

    if (argc == 1) {
        mode = 0;
    }

    mode_even = (mode & 1) == 0;
    if (mode_even) {
        for (i = 1; i < 256; ++i) {
            histogram[i] = 0;
        }
    }

    str += '';

    strl = str.length;
    for (i = 0; i < strl; ++i) {
        code = str.charCodeAt(i);
        if (code in histogram) {
            ++histogram[code];
        } else {
            histogram[code] = 1;
        }
    }

    if (mode > 0) {
        for (key in histogram) {
            if (histogram[key] == 0 != mode_even) {
                delete histogram[key];
            }
        }
    }

    if (mode < 3) {
        return histogram;
    } else {
        for (key in histogram) {
            tmp_arr.push(String.fromCharCode(key));
        }
        return tmp_arr.join("");
    }
}// }}}

// {{{ crc32
function crc32 ( str ) {
    // Calculates the crc32 polynomial of a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_crc32/
    // +       version: 809.522
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +   improved by: T0bsn
    // -    depends on: utf8_encode
    // *     example 1: crc32('Kevin van Zonneveld');
    // *     returns 1: 1249991249

    str = utf8_encode(str);
    var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

    var crc = 0;
    var x = 0;
    var y = 0;

    crc = crc ^ (-1);
    for( var i = 0, iTop = str.length; i < iTop; i++ ) {
        y = ( crc ^ str.charCodeAt( i ) ) & 0xFF;
        x = "0x" + table.substr( y * 9, 8 );
        crc = ( crc >>> 8 ) ^ x;
    }

    return crc ^ (-1);
}// }}}

// {{{ echo
function echo ( ) {
    // Output one or more strings
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_echo/
    // +       version: 901.2514
    // +   original by: Philip Peterson
    // +   improved by: echo is bad
    // +   improved by: Nate
    // +    revised by: Der Simon (http://innerdom.sourceforge.net/)
    // +   improved by: Brett Zamir
    // %        note 1: There are a few unsolved issues with this function. Summarizing:
    // %        note 1: converts all the special characters (e.g. tags) to HTML entities, 
    // %        note 1: thus reducing the usability of HTML formatting in echo().
    // %        note 1: 
    // %        note 1: InnerHTML() is better because it works (and it's fast),   
    // %        note 1: but using innerHTML on the BODY is very dangerous because
    // %        note 1: you will break all references to HTMLElements that were done before
    // %        note 1: 
    // %        note 1: There's no good place for a package like http://innerdom.sourceforge.net/
    // %        note 1: inside php.js
    // %        note 1:
    // *     example 1: echo('Hello', 'World');
    // *     returns 1: null
    
    var arg = '', argc = arguments.length, argv = arguments, i = 0;

    var stringToDOM = function (q){
        var d = document;
        var r = function(a){
            return a.replace(/\r/g,' ').replace(/\n/g,' ');
        };
        var s = function(a){
            return a.replace(/&amp;/g,'&').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&nbsp;/g,' ').replace(/&quot;/g,'"');
        };
        var t = function(a){
            return a.replace(/ /g,'');
        };
        var u = function(a){
            var b,c,e,f,g,h,i;
            b=d.createDocumentFragment();
            c=a.indexOf(' ');
            if (c === -1) {
                b.appendChild(d.createElement(a.toLowerCase()))
            } else {
                i = t(a.substring(0,c)).toLowerCase();
                a = a.substr(c+1);
                b.appendChild(d.createElement(i));
                while(a.length){
                    e=a.indexOf('=');
                    if(e>=0){
                        f=t(a.substring(0,e)).toLowerCase();
                        g=a.indexOf('"');
                        a=a.substr(g+1);
                        g=a.indexOf('"');
                        h=s(a.substring(0,g));
                        a=a.substr(g+2);
                        b.lastChild.setAttribute(f,h)
                    }else{
                        break
                    }
                }
            }
            return b
        }
        var v = function(a,b,c){
            var e,f;
            e=b;
            c=c.toLowerCase();
            f=e.indexOf('</'+c+'>');
            a=a.concat(e.substring(0,f));
            e=e.substr(f);
            while(a.indexOf('<'+c)!=-1){
                a=a.substr(a.indexOf('<'+c));
                a=a.substr(a.indexOf('>')+1);
                e=e.substr(e.indexOf('>')+1);
                f=e.indexOf('</'+c+'>');
                a=a.concat(e.substring(0,f));
                e=e.substr(f)
            }
            return b.length-e.length
        };
        var w = function(a){
            var b,c,e,f,g,h,i,j,k,l,m,n,o,p,q;
            b=d.createDocumentFragment();
            while(a&&a.length){
                c=a.indexOf('<');
                if(c===-1){
                    a=s(a);
                    b.appendChild(d.createTextNode(a));
                    a=null
                } else if(c){
                    q=s(a.substring(0,c));
                    b.appendChild(d.createTextNode(q));
                    a=a.substr(c)
                } else{
                    e=a.indexOf('<!--');
                    if(!e){
                        f=a.indexOf('-->');
                        g=a.substring(4,f);
                        g=s(g);
                        b.appendChild(d.createComment(g));
                        a=a.substr(f+3)
                    } else{
                        h=a.indexOf('>');
                        if(a.substring(h-1,h)==='/'){
                            i=a.indexOf('/>');
                            j=a.substring(1,i);
                            b.appendChild(u(j));
                            a=a.substr(i+2)
                        } else{
                            k=a.indexOf('>');
                            l=a.substring(1,k);
                            m=d.createDocumentFragment();
                            m.appendChild(u(l));
                            a=a.substr(k+1);
                            n=a.substring(0,a.indexOf('</'));
                            a=a.substr(a.indexOf('</'));
                            if(n.indexOf('<')!=-1){
                                o=m.lastChild.nodeName;
                                p=v(n,a,o);
                                n=n.concat(a.substring(0,p));
                                a=a.substr(p)
                            }
                            a=a.substr(a.indexOf('>')+1);
                            m.lastChild.appendChild(w(n));
                            b.appendChild(m)
                        }
                    }
                }
            }
            return b
        };
        return w(q)
    }

    for (i = 0; i < argc; i++ ) {
        arg = argv[i];
        if (document.createDocumentFragment && document.createTextNode && document.appendChild) {
            if (document.body) {
                document.body.appendChild(stringToDOM(arg));
            } else {
                document.documentElement.appendChild(stringToDOM(arg));
            }
            document.body.appendChild(stringToDOM(arg));
        } else if (document.write) {
            document.write(arg);
        } else {
            print(arg);
        }
    }
}// }}}

// {{{ explode
function explode( delimiter, string, limit ) {
    // Split a string by string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_explode/
    // +       version: 809.522
    // +     original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     improved by: kenneth
    // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     improved by: d3x
    // +     bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: explode(' ', 'Kevin van Zonneveld');
    // *     returns 1: {0: 'Kevin', 1: 'van', 2: 'Zonneveld'}
    // *     example 2: explode('=', 'a=bc=d', 2);
    // *     returns 2: ['a', 'bc=d']
 
    var emptyArray = { 0: '' };
    
    // third argument is not required
    if ( arguments.length < 2
        || typeof arguments[0] == 'undefined'
        || typeof arguments[1] == 'undefined' )
    {
        return null;
    }
 
    if ( delimiter === ''
        || delimiter === false
        || delimiter === null )
    {
        return false;
    }
 
    if ( typeof delimiter == 'function'
        || typeof delimiter == 'object'
        || typeof string == 'function'
        || typeof string == 'object' )
    {
        return emptyArray;
    }
 
    if ( delimiter === true ) {
        delimiter = '1';
    }
    
    if (!limit) {
        return string.toString().split(delimiter.toString());
    } else {
        // support for limit argument
        var splitted = string.toString().split(delimiter.toString());
        var partA = splitted.splice(0, limit - 1);
        var partB = splitted.join(delimiter.toString());
        partA.push(partB);
        return partA;
    }
}// }}}

// {{{ get_html_translation_table
function get_html_translation_table(table, quote_style) {
    // Returns the translation table used by htmlspecialchars() and htmlentities()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_get_html_translation_table/
    // +       version: 901.714
    // +   original by: Philip Peterson
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: noname
    // %          note: It has been decided that we're not going to add global
    // %          note: dependencies to php.js. Meaning the constants are not
    // %          note: real constants, but strings instead. integers are also supported if someone
    // %          note: chooses to create the constants themselves.
    // %          note: Table from http://www.the-art-of-web.com/html/character-codes/
    // *     example 1: get_html_translation_table('HTML_SPECIALCHARS');
    // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
    
    var entities = {}, histogram = {}, decimal = 0, symbol = '';
    var constMappingTable = {}, constMappingQuoteStyle = {};
    var useTable = {}, useQuoteStyle = {};
    
    useTable      = (table ? table.toUpperCase() : 'HTML_SPECIALCHARS');
    useQuoteStyle = (quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT');
    
    // Translate arguments
    constMappingTable[0]      = 'HTML_SPECIALCHARS';
    constMappingTable[1]      = 'HTML_ENTITIES';
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
    constMappingQuoteStyle[2] = 'ENT_COMPAT';
    constMappingQuoteStyle[3] = 'ENT_QUOTES';
    
    // Map numbers to strings for compatibilty with PHP constants
    if (!isNaN(useTable)) {
        useTable = constMappingTable[useTable];
    }
    if (!isNaN(useQuoteStyle)) {
        useQuoteStyle = constMappingQuoteStyle[useQuoteStyle];
    }
    
    if (useQuoteStyle != 'ENT_NOQUOTES') {
        entities['34'] = '&quot;';
    }

    if (useQuoteStyle == 'ENT_QUOTES') {
        entities['39'] = '&#039;';
    }

    if (useTable == 'HTML_SPECIALCHARS') {
        // ascii decimals for better compatibility
        entities['38'] = '&amp;';
        entities['60'] = '&lt;';
        entities['62'] = '&gt;';
    } else if (useTable == 'HTML_ENTITIES') {
        // ascii decimals for better compatibility
	    entities['38']  = '&amp;';
	    entities['60']  = '&lt;';
	    entities['62']  = '&gt;';
	    entities['160'] = '&nbsp;';
	    entities['161'] = '&iexcl;';
	    entities['162'] = '&cent;';
	    entities['163'] = '&pound;';
	    entities['164'] = '&curren;';
	    entities['165'] = '&yen;';
	    entities['166'] = '&brvbar;';
	    entities['167'] = '&sect;';
	    entities['168'] = '&uml;';
	    entities['169'] = '&copy;';
	    entities['170'] = '&ordf;';
	    entities['171'] = '&laquo;';
	    entities['172'] = '&not;';
	    entities['173'] = '&shy;';
	    entities['174'] = '&reg;';
	    entities['175'] = '&macr;';
	    entities['176'] = '&deg;';
	    entities['177'] = '&plusmn;';
	    entities['178'] = '&sup2;';
	    entities['179'] = '&sup3;';
	    entities['180'] = '&acute;';
	    entities['181'] = '&micro;';
	    entities['182'] = '&para;';
	    entities['183'] = '&middot;';
	    entities['184'] = '&cedil;';
	    entities['185'] = '&sup1;';
	    entities['186'] = '&ordm;';
	    entities['187'] = '&raquo;';
	    entities['188'] = '&frac14;';
	    entities['189'] = '&frac12;';
	    entities['190'] = '&frac34;';
	    entities['191'] = '&iquest;';
	    entities['192'] = '&Agrave;';
	    entities['193'] = '&Aacute;';
	    entities['194'] = '&Acirc;';
	    entities['195'] = '&Atilde;';
	    entities['196'] = '&Auml;';
	    entities['197'] = '&Aring;';
	    entities['198'] = '&AElig;';
	    entities['199'] = '&Ccedil;';
	    entities['200'] = '&Egrave;';
	    entities['201'] = '&Eacute;';
	    entities['202'] = '&Ecirc;';
	    entities['203'] = '&Euml;';
	    entities['204'] = '&Igrave;';
	    entities['205'] = '&Iacute;';
	    entities['206'] = '&Icirc;';
	    entities['207'] = '&Iuml;';
	    entities['208'] = '&ETH;';
	    entities['209'] = '&Ntilde;';
	    entities['210'] = '&Ograve;';
	    entities['211'] = '&Oacute;';
	    entities['212'] = '&Ocirc;';
	    entities['213'] = '&Otilde;';
	    entities['214'] = '&Ouml;';
	    entities['215'] = '&times;';
	    entities['216'] = '&Oslash;';
	    entities['217'] = '&Ugrave;';
	    entities['218'] = '&Uacute;';
	    entities['219'] = '&Ucirc;';
	    entities['220'] = '&Uuml;';
	    entities['221'] = '&Yacute;';
	    entities['222'] = '&THORN;';
	    entities['223'] = '&szlig;';
	    entities['224'] = '&agrave;';
	    entities['225'] = '&aacute;';
	    entities['226'] = '&acirc;';
	    entities['227'] = '&atilde;';
	    entities['228'] = '&auml;';
	    entities['229'] = '&aring;';
	    entities['230'] = '&aelig;';
	    entities['231'] = '&ccedil;';
	    entities['232'] = '&egrave;';
	    entities['233'] = '&eacute;';
	    entities['234'] = '&ecirc;';
	    entities['235'] = '&euml;';
	    entities['236'] = '&igrave;';
	    entities['237'] = '&iacute;';
	    entities['238'] = '&icirc;';
	    entities['239'] = '&iuml;';
	    entities['240'] = '&eth;';
	    entities['241'] = '&ntilde;';
	    entities['242'] = '&ograve;';
	    entities['243'] = '&oacute;';
	    entities['244'] = '&ocirc;';
	    entities['245'] = '&otilde;';
	    entities['246'] = '&ouml;';
	    entities['247'] = '&divide;';
	    entities['248'] = '&oslash;';
	    entities['249'] = '&ugrave;';
	    entities['250'] = '&uacute;';
	    entities['251'] = '&ucirc;';
	    entities['252'] = '&uuml;';
	    entities['253'] = '&yacute;';
	    entities['254'] = '&thorn;';
	    entities['255'] = '&yuml;';
    } else {
        throw Error("Table: "+useTable+' not supported');
        return false;
    }
    
    // ascii decimals to real symbols
    for (decimal in entities) {
        symbol = String.fromCharCode(decimal)
        histogram[symbol] = entities[decimal];
    }
    
    return histogram;
}// }}}

// {{{ html_entity_decode
function html_entity_decode( string, quote_style ) {
    // Convert all HTML entities to their applicable characters
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_html_entity_decode/
    // +       version: 901.714
    // +   original by: john (http://www.jd-tech.net)
    // +      input by: ger
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   improved by: marc andreu
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: get_html_translation_table
    // *     example 1: html_entity_decode('Kevin &amp; van Zonneveld');
    // *     returns 1: 'Kevin & van Zonneveld'
    // *     example 2: html_entity_decode('&amp;lt;');
    // *     returns 2: '&lt;'

    var histogram = {}, symbol = '', tmp_str = '', entity = '';
    tmp_str = string.toString();
    
    if (false === (histogram = get_html_translation_table('HTML_ENTITIES', quote_style))) {
        return false;
    }

    // &amp; must be the last character when decoding!
    delete(histogram['&']);
    histogram['&'] = '&amp;';

    for (symbol in histogram) {
        entity = histogram[symbol];
        tmp_str = tmp_str.split(entity).join(symbol);
    }
    
    return tmp_str;
}// }}}

// {{{ htmlentities
function htmlentities (string, quote_style) {
    // Convert all applicable characters to HTML entities
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_htmlentities/
    // +       version: 812.3017
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: nobbler
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: get_html_translation_table
    // *     example 1: htmlentities('Kevin & van Zonneveld');
    // *     returns 1: 'Kevin &amp; van Zonneveld'

    var histogram = {}, symbol = '', tmp_str = '', entity = '';
    tmp_str = string.toString();
    
    if (false === (histogram = get_html_translation_table('HTML_ENTITIES', quote_style))) {
        return false;
    }
    
    for (symbol in histogram) {
        entity = histogram[symbol];
        tmp_str = tmp_str.split(symbol).join(entity);
    }
    
    return tmp_str;
}// }}}

// {{{ htmlspecialchars
function htmlspecialchars (string, quote_style) {
    // Convert special characters to HTML entities
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_htmlspecialchars/
    // +       version: 812.3017
    // +   original by: Mirek Slugen
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Nathan
    // +   bugfixed by: Arno
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: get_html_translation_table
    // *     example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES');
    // *     returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'

    var histogram = {}, symbol = '', tmp_str = '', entity = '';
    tmp_str = string.toString();
    
    if (false === (histogram = get_html_translation_table('HTML_SPECIALCHARS', quote_style))) {
        return false;
    }
    
    for (symbol in histogram) {
        entity = histogram[symbol];
        tmp_str = tmp_str.split(symbol).join(entity);
    }
    
    return tmp_str;
}// }}}

// {{{ htmlspecialchars_decode
function htmlspecialchars_decode(string, quote_style) {
    // Convert special HTML entities back to characters
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_htmlspecialchars_decode/
    // +       version: 901.714
    // +   original by: Mirek Slugen
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Mateusz "loonquawl" Zalega
    // +      input by: ReverseSyntax
    // +      input by: Slawomir Kaniecki
    // +      input by: Scott Cariss
    // +      input by: Francois
    // +   bugfixed by: Onno Marsman
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: get_html_translation_table
    // *     example 1: htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES');
    // *     returns 1: '<p>this -> &quot;</p>'

    var histogram = {}, symbol = '', tmp_str = '', entity = '';
    tmp_str = string.toString();
    
    if (false === (histogram = get_html_translation_table('HTML_SPECIALCHARS', quote_style))) {
        return false;
    }

    // &amp; must be the last character when decoding!
    delete(histogram['&']);
    histogram['&'] = '&amp;';

    for (symbol in histogram) {
        entity = histogram[symbol];
        tmp_str = tmp_str.split(entity).join(symbol);
    }
    
    return tmp_str;
}// }}}

// {{{ implode
function implode( glue, pieces ) {
    // Join array elements with a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_implode/
    // +       version: 811.1314
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Waldo Malqui Silva
    // *     example 1: implode(' ', ['Kevin', 'van', 'Zonneveld']);
    // *     returns 1: 'Kevin van Zonneveld'

    return ( ( pieces instanceof Array ) ? pieces.join ( glue ) : pieces );
}// }}}

// {{{ join
function join( glue, pieces ) {
    // Alias of implode()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_join/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: implode
    // *     example 1: join(' ', ['Kevin', 'van', 'Zonneveld']);
    // *     returns 1: 'Kevin van Zonneveld'

    return implode( glue, pieces );
}// }}}

// {{{ lcfirst
function lcfirst( str ) {
    // Make a string&#039;s first character lowercase
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_lcfirst/
    // +       version: 901.1301
    // +   original by: Brett Zamir
    // *     example 1: lcfirst('Kevin Van Zonneveld');
    // *     returns 1: 'kevin Van Zonneveld'

    str += '';
    var f = str.charAt(0).toLowerCase();
    return f + str.substr(1);
}// }}}

// {{{ levenshtein
function levenshtein( str1, str2 ) {
    // Calculate Levenshtein distance between two strings
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_levenshtein/
    // +       version: 810.621
    // +   original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
    // +   bugfixed by: Onno Marsman
    // *     example 1: levenshtein('Kevin van Zonneveld', 'Kevin van Sommeveld');
    // *     returns 1: 3

    var s, l = (s = (str1+'').split("")).length, t = (str2 = (str2+'').split("")).length, i, j, m, n;
    if(!(l || t)) return Math.max(l, t);
    for(var a = [], i = l + 1; i; a[--i] = [i]);
    for(i = t + 1; a[0][--i] = i;);
    for(i = -1, m = s.length; ++i < m;){
        for(j = -1, n = str2.length; ++j < n;){
            a[(i *= 1) + 1][(j *= 1) + 1] = Math.min(a[i][j + 1] + 1, a[i + 1][j] + 1, a[i][j] + (s[i] != str2[j]));
        }
    }
    return a[l][t];
}// }}}

// {{{ ltrim
function ltrim ( str, charlist ) {
    // Strip whitespace (or other characters) from the beginning of a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_ltrim/
    // +       version: 810.621
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Erkekjetter
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: ltrim('    Kevin van Zonneveld    ');
    // *     returns 1: 'Kevin van Zonneveld    '

    charlist = !charlist ? ' \s\xA0' : (charlist+'').replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
    var re = new RegExp('^[' + charlist + ']+', 'g');
    return (str+'').replace(re, '');
}// }}}

// {{{ md5
function md5 ( str ) {
    // Calculate the md5 hash of a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_md5/
    // +       version: 810.112
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: utf8_encode
    // *     example 1: md5('Kevin van Zonneveld');
    // *     returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'

    var RotateLeft = function(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    };

    var AddUnsigned = function(lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    };

    var F = function(x,y,z) { return (x & y) | ((~x) & z); };
    var G = function(x,y,z) { return (x & z) | (y & (~z)); };
    var H = function(x,y,z) { return (x ^ y ^ z); };
    var I = function(x,y,z) { return (y ^ (x | (~z))); };

    var FF = function(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    var GG = function(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    var HH = function(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    var II = function(a,b,c,d,x,s,ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(RotateLeft(a, s), b);
    };

    var ConvertToWordArray = function(str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    };

    var WordToHex = function(lValue) {
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
            lByte = (lValue>>>(lCount*8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    };

    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;

    str = utf8_encode(str);
    x = ConvertToWordArray(str);
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
    
    xl = x.length;
    for (k=0;k<xl;k+=16) {
        AA=a; BB=b; CC=c; DD=d;
        a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=AddUnsigned(a,AA);
        b=AddUnsigned(b,BB);
        c=AddUnsigned(c,CC);
        d=AddUnsigned(d,DD);
    }

    var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

    return temp.toLowerCase();
}// }}}

// {{{ md5_file
function md5_file ( str_filename ) {
    // Calculates the md5 hash of a given file
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_md5_file/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: file_get_contents
    // -    depends on: md5
    // *     example 1: md5_file('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
    // *     returns 1: '202cb962ac59075b964b07152d234b70'

    buf = file_get_contents(str_filename);
    
    if (!buf) {
        return false;
    }
    
    return md5(buf);
}// }}}

// {{{ nl2br
function nl2br (str, is_xhtml) {
    // Inserts HTML line breaks before all newlines in a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_nl2br/
    // +       version: 810.1417
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Philip Peterson
    // +   improved by: Onno Marsman
    // +   improved by: Atli Þór
    // +   bugfixed by: Onno Marsman
    // *     example 1: nl2br('Kevin\nvan\nZonneveld');
    // *     returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
    // *     example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
    // *     returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
    // *     example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
    // *     returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'

    breakTag = '<br />';
    if (typeof is_xhtml != 'undefined' && !is_xhtml) {
        breakTag = '<br>';
    }

    return (str + '').replace(/([^>]?)\n/g, '$1'+ breakTag +'\n');
}// }}}

// {{{ number_format
function number_format( number, decimals, dec_point, thousands_sep ) {
    // Format a number with grouped thousands
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_number_format/
    // +       version: 902.1612
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     bugfix by: Michael White (http://getsprink.com)
    // +     bugfix by: Benjamin Lupton
    // +     bugfix by: Allan Jensen (http://www.winternet.no)
    // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +     bugfix by: Howard Yeend
    // +    revised by: Luke Smith (http://lucassmith.name)
    // +     bugfix by: Diogo Resende
    // +     bugfix by: Rival
    // %        note 1: For 1000.55 result with precision 1 in FF/Opera is 1,000.5, but in IE is 1,000.6
    // *     example 1: number_format(1234.56);
    // *     returns 1: '1,235'
    // *     example 2: number_format(1234.56, 2, ',', ' ');
    // *     returns 2: '1 234,56'
    // *     example 3: number_format(1234.5678, 2, '.', '');
    // *     returns 3: '1234.57'
    // *     example 4: number_format(67, 2, ',', '.');
    // *     returns 4: '67,00'
    // *     example 5: number_format(1000);
    // *     returns 5: '1,000'
    // *     example 6: number_format(67.311, 2);
    // *     returns 6: '67.31'

    var n = number, prec = decimals;
    n = !isFinite(+n) ? 0 : +n;
    prec = !isFinite(+prec) ? 0 : Math.abs(prec);
    var sep = (typeof thousands_sep == "undefined") ? ',' : thousands_sep;
    var dec = (typeof dec_point == "undefined") ? '.' : dec_point;

    var s = (prec > 0) ? n.toFixed(prec) : Math.round(n).toFixed(prec); //fix for IE parseFloat(0.55).toFixed(0) = 0;

    var abs = Math.abs(n).toFixed(prec);
    var _, i;

    if (abs >= 1000) {
        _ = abs.split(/\D/);
        i = _[0].length % 3 || 3;

        _[0] = s.slice(0,i + (n < 0)) +
              _[0].slice(i).replace(/(\d{3})/g, sep+'$1');

        s = _.join(dec);
    } else {
        s = s.replace('.', dec);
    }

    return s;
}// }}}

// {{{ ord
function ord( string ) {
    // Return ASCII value of character
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_ord/
    // +       version: 810.621
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: ord('K');
    // *     returns 1: 75

    return (string+'').charCodeAt(0);
}// }}}

// {{{ parse_str
function parse_str(str, array){
    // Parses the string into variables
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_parse_str/
    // +       version: 810.621
    // +   original by: Cagri Ekin
    // +   improved by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // *     example 1: parse_str('first=foo&second=bar');
    // *     returns 1: { first: 'foo', second: 'bar' }
    // *     example 2: parse_str('str_a=Jack+and+Jill+didn%27t+see+the+well.');
    // *     returns 2: { str_a: "Jack and Jill didn't see the well." }

    var glue1 = '=';
    var glue2 = '&';

    var array2 = (str+'').split(glue2);
    var array3 = [];
    var array2l = 0, tmp = '', x = 0;

    array2l = array2.length;
    for (x = 0; x<array2l; x++) {
        tmp = array2[x].split(glue1);
        array3[unescape(tmp[0])] = unescape(tmp[1]).replace(/[+]/g, ' ');
    }

    if (array) {
        array = array3;
    } else {
        return array3;
    }
}// }}}

// {{{ printf
function printf( ) {
    // Output a formatted string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_printf/
    // +       version: 902.122
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // +   improved by: Michael White (http://getsprink.com)
    // +   improved by: Brett Zamir
    // -    depends on: sprintf
    // *     example 1: printf("%01.2f", 123.1);
    // *     returns 1: 6

    var body, elmt;
    var ret = '';
    
    var HTMLNS = 'http://www.w3.org/1999/xhtml';
    body = document.getElementsByTagNameNS ?
      (document.getElementsByTagNameNS(HTMLNS, 'body')[0] ?
        document.getElementsByTagNameNS(HTMLNS, 'body')[0] :
        document.documentElement.lastChild) :
      document.getElementsByTagName('body')[0];

    if (!body) {
        return false;
    }
    
    ret = sprintf.apply(this, arguments);

    elmt = document.createTextNode(ret);
    body.appendChild(elmt);
    
    return ret.length;
}// }}}

// {{{ quotemeta
function quotemeta(str) {
    // Quote meta characters
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_quotemeta/
    // +       version: 812.311
    // +   original by: Paulo Ricardo F. Santos
    // *     example 1: quotemeta(". + * ? ^ ( $ )");
    // *     returns 1: '\. \+ \* \? \^ \( \$ \)'

    return (str+'').replace(/([\.\\\+\*\?\[\^\]\$\(\)])/g, '\\$1');
}// }}}

// {{{ rtrim
function rtrim ( str, charlist ) {
    // Strip whitespace (or other characters) from the end of a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_rtrim/
    // +       version: 810.621
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Erkekjetter
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: rtrim('    Kevin van Zonneveld    ');
    // *     returns 1: '    Kevin van Zonneveld'

    charlist = !charlist ? ' \s\xA0' : (charlist+'').replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
    var re = new RegExp('[' + charlist + ']+$', 'g');
    return (str+'').replace(re, '');
}// }}}

// {{{ sha1
function sha1 ( str ) {
    // Calculate the sha1 hash of a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_sha1/
    // +       version: 810.112
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // + namespaced by: Michael White (http://getsprink.com)
    // -    depends on: utf8_encode
    // *     example 1: sha1('Kevin van Zonneveld');
    // *     returns 1: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'

    var rotate_left = function(n,s) {
        var t4 = ( n<<s ) | (n>>>(32-s));
        return t4;
    };

    var lsb_hex = function(val) {
        var str="";
        var i;
        var vh;
        var vl;

        for( i=0; i<=6; i+=2 ) {
            vh = (val>>>(i*4+4))&0x0f;
            vl = (val>>>(i*4))&0x0f;
            str += vh.toString(16) + vl.toString(16);
        }
        return str;
    };

    var cvt_hex = function(val) {
        var str="";
        var i;
        var v;

        for( i=7; i>=0; i-- ) {
            v = (val>>>(i*4))&0x0f;
            str += v.toString(16);
        }
        return str;
    };

    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var temp;

    str = utf8_encode(str);
    var str_len = str.length;

    var word_array = new Array();
    for( i=0; i<str_len-3; i+=4 ) {
        j = str.charCodeAt(i)<<24 | str.charCodeAt(i+1)<<16 |
        str.charCodeAt(i+2)<<8 | str.charCodeAt(i+3);
        word_array.push( j );
    }

    switch( str_len % 4 ) {
        case 0:
            i = 0x080000000;
        break;
        case 1:
            i = str.charCodeAt(str_len-1)<<24 | 0x0800000;
        break;
        case 2:
            i = str.charCodeAt(str_len-2)<<24 | str.charCodeAt(str_len-1)<<16 | 0x08000;
        break;
        case 3:
            i = str.charCodeAt(str_len-3)<<24 | str.charCodeAt(str_len-2)<<16 | str.charCodeAt(str_len-1)<<8    | 0x80;
        break;
    }

    word_array.push( i );

    while( (word_array.length % 16) != 14 ) word_array.push( 0 );

    word_array.push( str_len>>>29 );
    word_array.push( (str_len<<3)&0x0ffffffff );

    for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
        for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
        for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);

        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;

        for( i= 0; i<=19; i++ ) {
            temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }

        for( i=20; i<=39; i++ ) {
            temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }

        for( i=40; i<=59; i++ ) {
            temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }

        for( i=60; i<=79; i++ ) {
            temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }

        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }

    var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
    return temp.toLowerCase();
}// }}}

// {{{ sha1_file
function sha1_file ( str_filename ) {
    // Calculate the sha1 hash of a file
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_sha1_file/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: file_get_contents
    // -    depends on: sha1
    // *     example 1: sha1_file('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
    // *     returns 1: '40bd001563085fc35165329ea1ff5c5ecbdbbeef'

    var buf = file_get_contents(str_filename);
    return sha1(buf);
}// }}}

// {{{ soundex
function soundex(str) {
    // Calculate the soundex key of a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_soundex/
    // +       version: 810.621
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: soundex('Kevin');
    // *     returns 1: 'K150'
    // *     example 2: soundex('Ellery');
    // *     returns 2: 'E460'
    // *     example 3: soundex('Euler');
    // *     returns 3: 'E460'

    var i, j, l, r, p = isNaN(p) ? 4 : p > 10 ? 10 : p < 4 ? 4 : p;
    var m = {BFPV: 1, CGJKQSXZ: 2, DT: 3, L: 4, MN: 5, R: 6};
    var r = (s = (str+'').toUpperCase().replace(/[^A-Z]/g, "").split("")).splice(0, 1);
    var sl = 0;

    sl = s.length;
    for (i = -1, l = sl; ++i < l;) {
        for (j in m) {
            if (j.indexOf(s[i]) + 1 && r[r.length-1] != m[j] && r.push(m[j])) {
                break;
            }
        }
    }

    return r.length > p && (r.length = p), r.join("") + (new Array(p - r.length + 1)).join("0");
}// }}}

// {{{ split
function split( delimiter, string ) {
    // Split string into array by regular expression
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_split/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: explode
    // *     example 1: split(' ', 'Kevin van Zonneveld');
    // *     returns 1: {0: 'Kevin', 1: 'van', 2: 'Zonneveld'}

    return explode( delimiter, string );
}// }}}

// {{{ sprintf
function sprintf( ) {
    // Return a formatted string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_sprintf/
    // +       version: 812.114
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Paulo Ricardo F. Santos
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: sprintf("%01.2f", 123.1);
    // *     returns 1: 123.10
    // *     example 2: sprintf("[%10s]", 'monkey');
    // *     returns 2: '[    monkey]'
    // *     example 3: sprintf("[%'#10s]", 'monkey');
    // *     returns 3: '[####monkey]'

    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments, i = 0, format = a[i++];

    // pad()
    var pad = function(str, len, chr, leftJustify) {
        if (!chr) chr = ' ';
        var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };

    // justify()
    var justify = function(value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        if (diff > 0) {
            if (leftJustify || !zeroPad) {
                value = pad(value, minWidth, customPadChar, leftJustify);
            } else {
                value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
            }
        }
        return value;
    };

    // formatBaseX()
    var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        // Note: casts negative numbers to positive ones
        var number = value >>> 0;
        prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
        value = prefix + pad(number.toString(base), precision || 0, '0', false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };

    // formatString()
    var formatString = function(value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        if (precision != null) {
            value = value.slice(0, precision);
        }
        return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    };

    // finalFormat()
    var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
        if (substring == '%%') return '%';

        // parse flags
        var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false, customPadChar = ' ';
        var flagsl = flags.length;
        for (var j = 0; flags && j < flagsl; j++) switch (flags.charAt(j)) {
            case ' ': positivePrefix = ' '; break;
            case '+': positivePrefix = '+'; break;
            case '-': leftJustify = true; break;
            case "'": customPadChar = flags.charAt(j+1); break;
            case '0': zeroPad = true; break;
            case '#': prefixBaseX = true; break;
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if (!minWidth) {
            minWidth = 0;
        } else if (minWidth == '*') {
            minWidth = +a[i++];
        } else if (minWidth.charAt(0) == '*') {
            minWidth = +a[minWidth.slice(1, -1)];
        } else {
            minWidth = +minWidth;
        }

        // Note: undocumented perl feature:
        if (minWidth < 0) {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if (!isFinite(minWidth)) {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if (!precision) {
            precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : void(0);
        } else if (precision == '*') {
            precision = +a[i++];
        } else if (precision.charAt(0) == '*') {
            precision = +a[precision.slice(1, -1)];
        } else {
            precision = +precision;
        }

        // grab value using valueIndex if required?
        var value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch (type) {
            case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
            case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd': {
                var number = parseInt(+value);
                var prefix = number < 0 ? '-' : positivePrefix;
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            }
            case 'e':
            case 'E':
            case 'f':
            case 'F':
            case 'g':
            case 'G': {
                var number = +value;
                var prefix = number < 0 ? '-' : positivePrefix;
                var method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                var textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                value = prefix + Math.abs(number)[method](precision);
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            }
            default: return substring;
        }
    };

    return format.replace(regex, doFormat);
}// }}}

// {{{ str_ireplace
function str_ireplace ( search, replace, subject ) {
    // Case-insensitive version of str_replace().
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_str_ireplace/
    // +       version: 810.621
    // +   original by: Martijn Wieringa
    // +      input by: penutbutterjelly
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    tweaked by: Jack
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: str_ireplace('l', 'l', 'HeLLo');
    // *     returns 1: 'Hello'

    var i, k = '';
    var searchl = 0;

    search += '';
    searchl = search.length;
    if (!(replace instanceof Array)) {
        replace = new Array(replace);
        if (search instanceof Array) {
            // If search is an array and replace is a string,
            // then this replacement string is used for every value of search
            while (searchl > replace.length) {
                replace[replace.length] = replace[0];
            }
        }
    }

    if (!(search instanceof Array)) {
        search = new Array(search);
    }
    while (search.length>replace.length) {
        // If replace has fewer values than search,
        // then an empty string is used for the rest of replacement values
        replace[replace.length] = '';
    }

    if (subject instanceof Array) {
        // If subject is an array, then the search and replace is performed
        // with every entry of subject , and the return value is an array as well.
        for (k in subject) {
            subject[k] = str_ireplace(search, replace, subject[k]);
        }
        return subject;
    }

    searchl = search.length;
    for (i = 0; i < searchl; i++) {
        reg = new RegExp(search[i], 'gi');
        subject = subject.replace(reg, replace[i]);
    }

    return subject;
}// }}}

// {{{ str_pad
function str_pad( input, pad_length, pad_string, pad_type ) {
    // Pad a string to a certain length with another string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_str_pad/
    // +       version: 810.819
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // + namespaced by: Michael White (http://getsprink.com)
    // *     example 1: str_pad('Kevin van Zonneveld', 30, '-=', 'STR_PAD_LEFT');
    // *     returns 1: '-=-=-=-=-=-Kevin van Zonneveld'
    // *     example 2: str_pad('Kevin van Zonneveld', 30, '-', 'STR_PAD_BOTH');
    // *     returns 2: '------Kevin van Zonneveld-----'

    var half = '', pad_to_go;

    var str_pad_repeater = function(s, len) {
        var collect = '', i;

        while(collect.length < len) collect += s;
        collect = collect.substr(0,len);

        return collect;
    };

    input += '';

    if (pad_type != 'STR_PAD_LEFT' && pad_type != 'STR_PAD_RIGHT' && pad_type != 'STR_PAD_BOTH') { pad_type = 'STR_PAD_RIGHT'; }
    if ((pad_to_go = pad_length - input.length) > 0) {
        if (pad_type == 'STR_PAD_LEFT') { input = str_pad_repeater(pad_string, pad_to_go) + input; }
        else if (pad_type == 'STR_PAD_RIGHT') { input = input + str_pad_repeater(pad_string, pad_to_go); }
        else if (pad_type == 'STR_PAD_BOTH') {
            half = str_pad_repeater(pad_string, Math.ceil(pad_to_go/2));
            input = half + input + half;
            input = input.substr(0, pad_length);
        }
    }

    return input;
}// }}}

// {{{ str_repeat
function str_repeat ( input, multiplier ) {
    // Repeat a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_str_repeat/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // *     example 1: str_repeat('-=', 10);
    // *     returns 1: '-=-=-=-=-=-=-=-=-=-='
    
    
    return new Array(multiplier+1).join(input); 
}// }}}

// {{{ str_replace
function str_replace(search, replace, subject) {
    // Replace all occurrences of the search string with the replacement string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_str_replace/
    // +       version: 812.1017
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Gabriel Paderni
    // +   improved by: Philip Peterson
    // +   improved by: Simon Willison (http://simonwillison.net)
    // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   bugfixed by: Anton Ongson
    // +      input by: Onno Marsman
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    tweaked by: Onno Marsman
    // *     example 1: str_replace(' ', '.', 'Kevin van Zonneveld');
    // *     returns 1: 'Kevin.van.Zonneveld'
    // *     example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars');
    // *     returns 2: 'hemmo, mars'

    var f = search, r = replace, s = subject;
    var ra = r instanceof Array, sa = s instanceof Array, f = [].concat(f), r = [].concat(r), i = (s = [].concat(s)).length;

    while (j = 0, i--) {
        if (s[i]) {
            while (s[i] = (s[i]+'').split(f[j]).join(ra ? r[j] || "" : r[0]), ++j in f){};
        }
    };

    return sa ? s : s[0];
}// }}}

// {{{ str_rot13
function str_rot13( str ) {
    // Perform the rot13 transform on a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_str_rot13/
    // +       version: 810.621
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +   bugfixed by: Onno Marsman
    // *     example 1: str_rot13('Kevin van Zonneveld');
    // *     returns 1: 'Xriva ina Mbaariryq'
    // *     example 2: str_rot13('Xriva ina Mbaariryq');
    // *     returns 2: 'Kevin van Zonneveld'

    return (str+'').replace(/[A-Za-z]/g, function (c) {
        return String.fromCharCode((((c = c.charCodeAt(0)) & 223) - 52) % 26 + (c & 32) + 65);
    });
}// }}}

// {{{ str_shuffle
function str_shuffle (str) {
    // Randomly shuffles a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_str_shuffle/
    // +       version: 901.810
    // +   original by: Brett Zamir
    // *     example 1: shuffled = str_shuffle("abcdef");
    // *     results 1: shuffled.length == 6
    
    if (str == undefined) {
        throw 'Wrong parameter count for str_shuffle()';
    }
    
    var getRandomInt = function (max) {
        return Math.floor(Math.random() * (max + 1));
    };
    var newStr = '', rand = 0;
    
    while (str.length) {
        rand = getRandomInt(str.length-1);
        newStr += str[rand];
        str = str.substring(0, rand)+str.substr(rand+1);
    }
    
    return newStr;
}// }}}

// {{{ str_split
function str_split ( f_string, f_split_length){
    // Convert a string to an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_str_split/
    // +       version: 810.621
    // +     original by: Martijn Wieringa
    // +     improved by: Brett Zamir
    // +     bugfixed by: Onno Marsman
    // *         example 1: str_split('Hello Friend', 3);
    // *         returns 1: ['Hel', 'lo ', 'Fri', 'end']

    f_string += '';

    if (f_split_length == undefined) {
        f_split_length = 1;
    }
    if(f_split_length > 0){
        var result = [];
        while(f_string.length > f_split_length) {
            result[result.length] = f_string.substring(0, f_split_length);
            f_string = f_string.substring(f_split_length);
        }
        result[result.length] = f_string;
        return result;
    }
    return false;
}// }}}

// {{{ strcasecmp
function strcasecmp (f_string1, f_string2){
    // Binary safe case-insensitive string comparison
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strcasecmp/
    // +       version: 810.621
    // +     original by: Martijn Wieringa
    // +     bugfixed by: Onno Marsman
    // *         example 1: strcasecmp('Hello', 'hello');
    // *         returns 1: 0

    var string1 = (f_string1+'').toLowerCase();
    var string2 = (f_string2+'').toLowerCase();

    if(string1 > string2) {
      return 1;
    }
    else if(string1 == string2) {
      return 0;
    }

    return -1;
}// }}}

// {{{ strchr
function strchr ( haystack, needle, bool ) {
    // Alias of strstr()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strchr/
    // +       version: 809.522
    // +   original by: Philip Peterson
    // -    depends on: strstr
    // *     example 1: strchr('Kevin van Zonneveld', 'van');
    // *     returns 1: 'van Zonneveld'
    // *     example 2: strchr('Kevin van Zonneveld', 'van', true);
    // *     returns 2: 'Kevin '
 
    return strstr( haystack, needle, bool );
}// }}}

// {{{ strcmp
function strcmp ( str1, str2 ) {
    // Binary safe string comparison
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strcmp/
    // +       version: 811.1314
    // +   original by: Waldo Malqui Silva
    // +      input by: Steve Hilder
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: gorthaur
    // *     example 1: strcmp( 'waldo', 'owald' );
    // *     returns 1: 1
    // *     example 2: strcmp( 'owald', 'waldo' );
    // *     returns 2: -1

    return ( ( str1 == str2 ) ? 0 : ( ( str1 > str2 ) ? 1 : -1 ) );
}// }}}

// {{{ strcspn
function strcspn (str, mask, start, length) {
    // Find length of initial segment not matching mask
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strcspn/
    // +       version: 901.1301
    // +   original by: Brett Zamir
    // *     example 1: strcspn('abcdefg123', '1234567890');
    // *     returns 1: 7
    // *     example 2: strcspn('123abc', '1234567890');
    // *     returns 2: 3

    start = start ? start : 0;
    var count = (length && ((start + length) < str.length)) ? start + length : str.length;
    strct:
    for (var i=start, lgth=0; i < count; i++) {
        for (var j=0; j < mask.length; j++) {
            if (str[i].indexOf(mask[j]) !== -1) {
                continue strct;
            }
        }
        ++lgth;
    }
    
    return lgth;
}// }}}

// {{{ strip_tags
function strip_tags(str, allowed_tags) {
    // Strip HTML and PHP tags from a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strip_tags/
    // +       version: 811.1812
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Luke Godfrey
    // +      input by: Pul
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +      input by: Alex
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Marc Palau
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: strip_tags('<p>Kevin</p> <br /><b>van</b> <i>Zonneveld</i>', '<i><b>');
    // *     returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
    // *     example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
    // *     returns 2: '<p>Kevin van Zonneveld</p>'
    // *     example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
    // *     returns 3: '<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>'

    var key = '', tag = '', allowed = false;
    var matches = allowed_array = [];

    var replacer = function(search, replace, str) {
        return str.split(search).join(replace);
    };

    // Build allowes tags associative array
    if (allowed_tags) {
        allowed_array = allowed_tags.match(/([a-zA-Z]+)/gi);
    }
	
    str += '';

    // Match tags
    matches = str.match(/(<\/?[^>]+>)/gi);

    // Go through all HTML tags
    for (key in matches) {
        if (isNaN(key)) {
            // IE7 Hack
            continue;
        }

        // Save HTML tag
        html = matches[key].toString();

        // Is tag not in allowed list? Remove from str!
        allowed = false;

        // Go through all allowed tags
        for (k in allowed_array) {
            // Init
            allowed_tag = allowed_array[k];
            i = -1;

            if (i != 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+'>');}
            if (i != 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+' ');}
            if (i != 0) { i = html.toLowerCase().indexOf('</'+allowed_tag)   ;}

            // Determine
            if (i == 0) {
                allowed = true;
                break;
            }
        }

        if (!allowed) {
            str = replacer(html, "", str); // Custom replace. No regexing
        }
    }

    return str;
}// }}}

// {{{ stripos
function stripos ( f_haystack, f_needle, f_offset ){
    // Find position of first occurrence of a case-insensitive string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_stripos/
    // +       version: 810.617
    // +     original by: Martijn Wieringa
    // +      revised by: Onno Marsman
    // *         example 1: stripos('ABC', 'a');
    // *         returns 1: 0

    var haystack = (f_haystack+'').toLowerCase();
    var needle = (f_needle+'').toLowerCase();
    var index = 0;
 
    if ((index = haystack.indexOf(needle, f_offset)) !== -1) {
        return index;
    }
    return false;
}// }}}

// {{{ stripslashes
function stripslashes( str ) {
    // Un-quote string quoted with addslashes()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_stripslashes/
    // +       version: 812.1714
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +      fixed by: Mick@el
    // +   improved by: marrtins
    // +   bugfixed by: Onno Marsman
    // +   improved by: rezna
    // *     example 1: stripslashes('Kevin\'s code');
    // *     returns 1: "Kevin's code"
    // *     example 2: stripslashes('Kevin\\\'s code');
    // *     returns 2: "Kevin\'s code"

    return (str+'').replace(/\0/g, '0').replace(/\\([\\'"])/g, '$1');
}// }}}

// {{{ stristr
function stristr( haystack, needle, bool ) {
    // Case-insensitive strstr()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_stristr/
    // +       version: 810.819
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfxied by: Onno Marsman
    // *     example 1: stristr('Kevin van Zonneveld', 'Van');
    // *     returns 1: 'van Zonneveld'
    // *     example 2: stristr('Kevin van Zonneveld', 'VAN', true);
    // *     returns 2: 'Kevin '

    var pos = 0;

    haystack += '';
    pos = haystack.toLowerCase().indexOf( (needle+'').toLowerCase() );
    if( pos == -1 ){
        return false;
    } else{
        if( bool ){
            return haystack.substr( 0, pos );
        } else{
            return haystack.slice( pos );
        }
    }
}// }}}

// {{{ strlen
function strlen (string) {
    // Get string length
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strlen/
    // +       version: 901.1520
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Sakimori
    // +      input by: Kirk Strobeck
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +    revised by: Brett Zamir
    // %        note 1: May look like overkill, but in order to be truly faithful to handling all Unicode
    // %        note 1: characters and to this function in PHP which does not count the number of bytes
    // %        note 1: but counts the number of characters, something like this is really necessary.
    // *     example 1: strlen('Kevin van Zonneveld');
    // *     returns 1: 19
    // *     example 2: strlen('A\ud87e\udc04Z');
    // *     returns 2: 3

    var str = string+'';
    var i = 0, chr = '', lgth = 0;

    var getWholeChar = function (str, i) {
        var code = str.charCodeAt(i);
        var next = '', prev = '';
        if (0xD800 <= code && code <= 0xDBFF) { // High surrogate(could change last hex to 0xDB7F to treat high private surrogates as single characters)
            if (str.length <= (i+1))  {
                throw 'High surrogate without following low surrogate';
            }
            next = str.charCodeAt(i+1);
            if (0xDC00 > next || next > 0xDFFF) {
                throw 'High surrogate without following low surrogate';
            }
            return str[i]+str[i+1];
        } else if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
            if (i === 0) {
                throw 'Low surrogate without preceding high surrogate';
            }
            prev = str.charCodeAt(i-1);
            if (0xD800 > prev || prev > 0xDBFF) { //(could change last hex to 0xDB7F to treat high private surrogates as single characters)
                throw 'Low surrogate without preceding high surrogate';
            }
            return false; // We can pass over low surrogates now as the second component in a pair which we have already processed
        }
        return str[i];
    };

    for (i=0, lgth=0; i < str.length; i++) {
        if ((chr = getWholeChar(str, i)) === false) {
            continue;
        } // Adapt this line at the top of any loop, passing in the whole string and the current iteration and returning a variable to represent the individual character; purpose is to treat the first part of a surrogate pair as the whole character and then ignore the second part
        lgth++;
    }
    return lgth;
}// }}}

// {{{ strnatcasecmp
function strnatcasecmp(str1, str2) {
    // Case insensitive string comparisons using a &quot;natural order&quot; algorithm
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strnatcasecmp/
    // +       version: 901.2514
    // +      original by: Martin Pool
    // + reimplemented by: Pierre-Luc Paour
    // + reimplemented by: Kristof Coomans (SCK-CEN (Belgian Nucleair Research Centre))
    // + reimplemented by: Brett Zamir
    // +      bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: strnatcasecmp(10, 1);
    // *     returns 1: 1
    // *     example 1: strnatcasecmp('1', '10');
    // *     returns 1: -1

    a = (str1+'').toLowerCase();
    b = (str2+'').toLowerCase();

    var isWhitespaceChar = function(a) {
        return a.charCodeAt(0) <= 32;
    }

    var isDigitChar = function (a) {
        var charCode = a.charCodeAt(0);
        return ( charCode >= 48  && charCode <= 57 );
    }

    var compareRight = function(a,b) {
        var bias = 0;
        var ia = 0;
        var ib = 0;

        var ca;
        var cb;

        // The longest run of digits wins.  That aside, the greatest
        // value wins, but we can't know that it will until we've scanned
        // both numbers to know that they have the same magnitude, so we
        // remember it in BIAS.
        for (;; ia++, ib++) {
            ca = a.charAt(ia);
            cb = b.charAt(ib);

            if (!isDigitChar(ca)
                && !isDigitChar(cb)) {
                return bias;
            } else if (!isDigitChar(ca)) {
                return -1;
            } else if (!isDigitChar(cb)) {
                return +1;
            } else if (ca < cb) {
                if (bias == 0) {
                    bias = -1;
                }
            } else if (ca > cb) {
                if (bias == 0)
                    bias = +1;
            } else if (ca == 0 && cb == 0) {
                return bias;
            }
        }
    }

    var ia = 0, ib = 0;
    var nza = 0, nzb = 0;
    var ca, cb;
    var result;

    while (true) {
        // only count the number of zeroes leading the last number compared
        nza = nzb = 0;

        ca = a.charAt(ia);
        cb = b.charAt(ib);

        // skip over leading spaces or zeros
        while ( isWhitespaceChar( ca ) || ca =='0' ) {
            if (ca == '0') {
                nza++;
            } else {
                // only count consecutive zeroes
                nza = 0;
            }

            ca = a.charAt(++ia);
        }

        while ( isWhitespaceChar( cb ) || cb == '0') {
            if (cb == '0') {
                nzb++;
            } else {
                // only count consecutive zeroes
                nzb = 0;
            }

            cb = b.charAt(++ib);
        }

        // process run of digits
        if (isDigitChar(ca) && isDigitChar(cb)) {
            if ((result = compareRight(a.substring(ia), b.substring(ib))) != 0) {
                return result;
            }
        }

        if (ca == 0 && cb == 0) {
            // The strings compare the same.  Perhaps the caller
            // will want to call strcmp to break the tie.
            return nza - nzb;
        }

        if (ca < cb) {
            return -1;
        } else if (ca > cb) {
            return +1;
        }

        ++ia; ++ib;
    }
}// }}}

// {{{ strnatcmp
function strnatcmp ( f_string1, f_string2, f_version ) {
    // String comparisons using a &quot;natural order&quot; algorithm
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strnatcmp/
    // +       version: 810.819
    // +   original by: Martijn Wieringa
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // -    depends on: strcmp
    // %          note: Added f_version argument against code guidelines, because it's so neat
    // *     example 1: strnatcmp('Price 12.9', 'Price 12.15');
    // *     returns 1: 1
    // *     example 2: strnatcmp('Price 12.09', 'Price 12.15');
    // *     returns 2: -1
    // *     example 3: strnatcmp('Price 12.90', 'Price 12.15');
    // *     returns 3: 1
    // *     example 4: strnatcmp('Version 12.9', 'Version 12.15', true);
    // *     returns 4: -6
    // *     example 5: strnatcmp('Version 12.15', 'Version 12.9', true);
    // *     returns 5: 6

    if (f_version == undefined) {
        f_version = false;
    }

    var __strnatcmp_split = function( f_string ) {
        var result = new Array();
        var buffer = '';
        var chr = '';
        var i = 0, f_stringl = 0;

        var text = true;

        f_stringl = f_string.length;
        for (i = 0; i < f_stringl; i++) {
            chr = f_string.substring(i, i + 1);
            if (chr.match(/[0-9]/)) {
                if (text) {
                    if(buffer.length > 0){
                        result[result.length] = buffer;
                        buffer = '';
                    }

                    text = false;
                }
                buffer += chr;
            } else if ((text == false) && (chr == '.') && (i < (f_string.length - 1)) && (f_string.substring(i + 1, i + 2).match(/[0-9]/))) {
                result[result.length] = buffer;
                buffer = '';
            } else {
                if (text == false) {
                    if (buffer.length > 0) {
                        result[result.length] = parseInt(buffer);
                        buffer = '';
                    }
                    text = true;
                }
                buffer += chr;
            }
        }

        if (buffer.length > 0) {
            if (text) {
                result[result.length] = buffer;
            } else {
                result[result.length] = parseInt(buffer);
            }
        }

        return result;
    };

    var array1 = __strnatcmp_split(f_string1+'');
    var array2 = __strnatcmp_split(f_string2+'');

    var len = array1.length;
    var text = true;

    var result = -1;
    var r = 0;

    if (len > array2.length) {
        len = array2.length;
        result = 1;
    }

    for (i = 0; i < len; i++) {
        if (isNaN(array1[i])) {
            if (isNaN(array2[i])) {
                text = true;

                if ((r = strcmp(array1[i], array2[i])) != 0) {
                    return r;
                }
            } else if (text){
                return 1;
            } else {
                return -1;
            }
        } else if (isNaN(array2[i])) {
            if(text) {
                return -1;
            } else{
                return 1;
            }
        } else {
            if(text || f_version){
                if ((r = (array1[i] - array2[i])) != 0) {
                    return r;
                }
            } else {
                if ((r = strcmp(array1[i].toString(), array2[i].toString())) != 0) {
                    return r;
                }
            }

            text = false;
        }
    }

    return result;
}// }}}

// {{{ strncasecmp
function strncasecmp (str1, str2, len) {
    // Binary safe case-insensitive string comparison of the first n characters
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strncasecmp/
    // +       version: 810.819
    // +   original by: Saulo Vallory
    // +      input by: Nate
    // +   bugfixed by: Onno Marsman
    // %          note: Returns < 0 if str1 is less than str2 ; > 0 if str1 is greater than str2 , and 0 if they are equal.
    // *     example 1: strncasecmp('Price 12.9', 'Price 12.15', 2);
    // *     returns 1: 0
    // *     example 2: strncasecmp('Price 12.09', 'Price 12.15', 10);
    // *     returns 2: -1
    // *     example 3: strncasecmp('Price 12.90', 'Price 12.15', 30);
    // *     returns 3: 8
    // *     example 4: strncasecmp('Version 12.9', 'Version 12.15', 20);
    // *     returns 4: 8
    // *     example 5: strncasecmp('Version 12.15', 'Version 12.9', 20);
    // *     returns 5: -8

    var diff;
    str1 = (str1+'').toLowerCase().substr(0,len);
    str2 = (str2+'').toLowerCase().substr(0,len);

    if(str1.length !== str2.length) {
        if(str1.length < str2.length) {
            len = str1.length;
            if(str2.substr(0, str1.length) == str1) {
                return str1.length - str2.length; // return the difference of chars
            }
        } else {
            len = str2.length;
            // str1 is longer than str2
            if(str1.substr(0, str2.length) == str2) {
                return str1.length - str2.length; // return the difference of chars
            }
        }
    } else {
        // Avoids trying to get a char that does not exist
        len = str1.length;
    }

    for(diff = 0, i=0; i < len; i++) {
        diff = str1.charCodeAt(i) - str2.charCodeAt(i);
        if(diff !== 0) {
            return diff;
        }
    }

    return 0;
}// }}}

// {{{ strncmp
function strncmp ( str1, str2, lgth ) {
    // Binary safe string comparison of the first n characters
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strncmp/
    // +       version: 902.122
    // +      original by: Waldo Malqui Silva
    // +         input by: Steve Hilder
    // +      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +       revised by: gorthaur
    // + reimplemented by: Brett Zamir
    // *     example 1: strncmp('aaa', 'aab', 2);
    // *     returns 1: 0
    // *     example 2: strncmp('aaa', 'aab', 3 );
    // *     returns 2: -1

    var s1 = (str1+'').substr(0, lgth);
    var s2 = (str2+'').substr(0, lgth);
    
    return ( ( s1 == s2 ) ? 0 : ( ( s1 > s2 ) ? 1 : -1 ) );
}// }}}

// {{{ strpbrk
function strpbrk( haystack, char_list ) {
    // Search a string for any of a set of characters
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strpbrk/
    // +       version: 810.819
    // +   original by: Alfonso Jimenez (http://www.alfonsojimenez.com)
    // +   bugfixed by: Onno Marsman
    // *     example 1: strpbrk('This is a Simple text.', 'is');
    // *     returns 1: 'is is a Simple text.'

    haystack += '';
    char_list += '';
    var lon = haystack.length;
    var lon_search = char_list.length;
    var ret = false;
    var stack = '';

    if (lon >= lon_search) {
        if (lon == lon_search) {
            if (haystack == char_list){
                ret = haystack;
            }
        } else {
            j = 0;
            i = 0;
            while (i < lon_search && j < lon && !ret) {
                if (char_list[i] == haystack[j]) {
                    i++;
                    if (i == lon_search) {
                        ret = true;
                    }
                }
                j++;
            }
            if (ret) {
                for(i = (j-lon_search); i < lon; i++){
                    stack += haystack[i];
                }
            }
            if (stack != '') {
                ret = stack;
            }
        }
    }
    return ret;
}// }}}

// {{{ strpos
function strpos( haystack, needle, offset){
    // Find position of first occurrence of a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strpos/
    // +       version: 810.612
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Onno Marsman    
    // *     example 1: strpos('Kevin van Zonneveld', 'e', 5);
    // *     returns 1: 14

    var i = (haystack+'').indexOf( needle, offset ); 
    return i===-1 ? false : i;
}// }}}

// {{{ strrchr
function strrchr (haystack, needle) {
    // Find the last occurrence of a character in a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strrchr/
    // +       version: 901.810
    // +   original by: Brett Zamir
    // *     example 1: strrchr("Line 1\nLine 2\nLine 3", 10).substr(1)
    // *     returns 1: 'Line 3'

    var pos = 0;

    if (typeof needle !== 'string') {
        needle = String.fromCharCode(parseInt(needle, 10));
    }
    needle = needle[0];
    pos = haystack.lastIndexOf(needle);
    if (pos === -1) {
        return false;
    }

    return haystack.substr(pos);
}// }}}

// {{{ strrev
function strrev( string ){
    // Reverse a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strrev/
    // +       version: 810.819
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: strrev('Kevin van Zonneveld');
    // *     returns 1: 'dlevennoZ nav niveK'

    var ret = '', i = 0;

    string += '';
    for ( i = string.length-1; i >= 0; i-- ){
       ret += string.charAt(i);
    }

    return ret;
}// }}}

// {{{ strripos
function strripos( haystack, needle, offset){
    // Find position of last occurrence of a case-insensitive string in a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strripos/
    // +       version: 810.620
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: strripos('Kevin van Zonneveld', 'E');
    // *     returns 1: 16

    var i = (haystack+'').toLowerCase().lastIndexOf( (needle+'').toLowerCase(), offset ); // returns -1
    return i >= 0 ? i : false;
}// }}}

// {{{ strrpos
function strrpos( haystack, needle, offset){
    // Find position of last occurrence of a char in a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strrpos/
    // +       version: 810.819
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: strrpos('Kevin van Zonneveld', 'e');
    // *     returns 1: 16

    var i = (haystack+'').lastIndexOf( needle, offset ); // returns -1
    return i >= 0 ? i : false;
}// }}}

// {{{ strspn
function strspn(str1, str2, start, lgth){
    // Find length of initial segment matching mask
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strspn/
    // +       version: 812.3015
    // +   original by: Valentina De Rosa
    // +   improved by: Brett Zamir
    // *     example 1: strspn('42 is the answer, what is the question ...', '1234567890');
    // *     returns 1: 2
    // *     example 2: strspn('foo', 'o', 1, 2);
    // *     returns 2: 2

    var found;
    var stri;
    var strj;
    var j = 0;
    var i = 0;

    start = start ? (start < 0 ? (str1.length+start) : start) : 0;
    lgth = lgth ? ((lgth < 0) ? (str1.length+lgth-start) : lgth) : str1.length-start;
    str1 = str1.substr(start, lgth);

    for(i = 0; i < str1.length; i++){
        found = 0;
        stri  = str1.substring(i,i+1);
        for (j = 0; j <= str2.length; j++) {
            strj = str2.substring(j,j+1);
            if (stri == strj) {
                found = 1;
                break;
            }
        }
        if (found != 1) {
            return i;
        }
    }

    return i;
}// }}}

// {{{ strstr
function strstr( haystack, needle, bool ) {
    // Find first occurrence of a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strstr/
    // +       version: 810.819
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: strstr('Kevin van Zonneveld', 'van');
    // *     returns 1: 'van Zonneveld'
    // *     example 2: strstr('Kevin van Zonneveld', 'van', true);
    // *     returns 2: 'Kevin '

    var pos = 0;

    haystack += '';
    pos = haystack.indexOf( needle );
    if( pos == -1 ){
        return false;
    } else{
        if( bool ){
            return haystack.substr( 0, pos );
        } else{
            return haystack.slice( pos );
        }
    }
}// }}}

// {{{ strtok
function strtok (str, tokens) {
    // Tokenize string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strtok/
    // +       version: 901.810
    // +   original by: Brett Zamir
    // %        note 1: Use tab and newline as tokenizing characters as well
    // *     example 1: $string = "\t\t\t\nThis is\tan example\nstring\n";
    // *     example 1: $tok = strtok($string, " \n\t");
    // *     example 1: $b = '';
    // *     example 1: while($tok !== false) {$b += "Word="+$tok+"\n"; $tok = strtok(" \n\t");}
    // *     example 1: $b
    // *     returns 1: "Word=This\nWord=is\nWord=an\nWord=example\nWord=string\n"

    if (tokens === undefined) {
        tokens = str;
        str = strtok.leftOver;
    }
    if (str.length === 0) {
        return false;
    }
    if (tokens.indexOf(str[0]) !== -1) {
        return strtok(str.substr(1), tokens);
    }
    for (var i=0; i < str.length; i++) {
        if (tokens.indexOf(str[i]) !== -1) {
            break;
        }
    }
    strtok.leftOver = str.substr(i+1);
    return str.substring(0, i);
}// }}}

// {{{ strtolower
function strtolower( str ) {
    // Make a string lowercase
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strtolower/
    // +       version: 809.2912
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Onno Marsman
    // *     example 1: strtolower('Kevin van Zonneveld');
    // *     returns 1: 'kevin van zonneveld'

    return (str+'').toLowerCase();
}// }}}

// {{{ strtoupper
function strtoupper( str ) {
    // Make a string uppercase
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strtoupper/
    // +       version: 809.2912
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Onno Marsman
    // *     example 1: strtoupper('Kevin van Zonneveld');
    // *     returns 1: 'KEVIN VAN ZONNEVELD'

    return (str+'').toUpperCase();
}// }}}

// {{{ strtr
function strtr (str, from, to) {
    // Translate certain characters
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strtr/
    // +       version: 901.810
    // +   original by: Brett Zamir
    // *     example 1: $trans = {"hello" : "hi", "hi" : "hello"};
    // *     example 1: strtr("hi all, I said hello", $trans)
    // *     returns 1: 'hello all, I said hi'
    // *     example 2: strtr('äaabaåccasdeöoo', 'äåö','aao');
    // *     returns 2: 'aaabaaccasdeooo'

    var fr = '', i = 0, lgth = 0;

    if (typeof from === 'object') {
        for (fr in from) {
            str = str.replace(fr, from[fr]);
        }
        return str;
    }
    
    lgth = to.length;
    if (from.length < to.length) {
        lgth = from.length;
    }
    for (i = 0; i < lgth; i++) {
        str = str.replace(from[i], to[i]);
    }
    
    return str;
}// }}}

// {{{ substr
function substr( f_string, f_start, f_length ) {
    // Return part of a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_substr/
    // +       version: 810.819
    // +     original by: Martijn Wieringa
    // +     bugfixed by: T.Wild
    // +      tweaked by: Onno Marsman
    // *       example 1: substr('abcdef', 0, -1);
    // *       returns 1: 'abcde'
    // *       example 2: substr(2, 0, -6);
    // *       returns 2: ''

    f_string += '';

    if(f_start < 0) {
        f_start += f_string.length;
    }

    if(f_length == undefined) {
        f_length = f_string.length;
    } else if(f_length < 0){
        f_length += f_string.length;
    } else {
        f_length += f_start;
    }

    if(f_length < f_start) {
        f_length = f_start;
    }

    return f_string.substring(f_start, f_length);
}// }}}

// {{{ substr_count
function substr_count( haystack, needle, offset, length ) {
    // Count the number of substring occurrences
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_substr_count/
    // +       version: 810.819
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: substr_count('Kevin van Zonneveld', 'e');
    // *     returns 1: 3
    // *     example 2: substr_count('Kevin van Zonneveld', 'K', 1);
    // *     returns 2: 0
    // *     example 3: substr_count('Kevin van Zonneveld', 'Z', 0, 10);
    // *     returns 3: false

    var pos = 0, cnt = 0;

    haystack += '';
    needle += '';
    if(isNaN(offset)) offset = 0;
    if(isNaN(length)) length = 0;
    offset--;

    while( (offset = haystack.indexOf(needle, offset+1)) != -1 ){
        if(length > 0 && (offset+needle.length) > length){
            return false;
        } else{
            cnt++;
        }
    }

    return cnt;
}// }}}

// {{{ trim
function trim (str, charlist) {
    // Strip whitespace (or other characters) from the beginning and end of a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_trim/
    // +       version: 810.2018
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: mdsjack (http://www.mdsjack.bo.it)
    // +   improved by: Alexander Ermolaev (http://snippets.dzone.com/user/AlexanderErmolaev)
    // +      input by: Erkekjetter
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: DxGx
    // +   improved by: Steven Levithan (http://blog.stevenlevithan.com)
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // *     example 1: trim('    Kevin van Zonneveld    ');
    // *     returns 1: 'Kevin van Zonneveld'
    // *     example 2: trim('Hello World', 'Hdle');
    // *     returns 2: 'o Wor'
    // *     example 3: trim(16, 1);
    // *     returns 3: 6

    var whitespace, l = 0, i = 0;
    str += '';
    
    if (!charlist) {
        // default list
        whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
    } else {
        // preg_quote custom list
        charlist += '';
        whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
    }
    
    l = str.length;
    for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i);
            break;
        }
    }
    
    l = str.length;
    for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1);
            break;
        }
    }
    
    return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}// }}}

// {{{ ucfirst
function ucfirst( str ) {
    // Make a string&#039;s first character uppercase
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_ucfirst/
    // +       version: 901.1301
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   improved by: Brett Zamir
    // *     example 1: ucfirst('kevin van zonneveld');
    // *     returns 1: 'Kevin van zonneveld'

    str += '';
    var f = str.charAt(0).toUpperCase();
    return f + str.substr(1);
}// }}}

// {{{ ucwords
function ucwords( str ) {
    // Uppercase the first character of each word in a string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_ucwords/
    // +       version: 811.1314
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Waldo Malqui Silva
    // +   bugfixed by: Onno Marsman
    // *     example 1: ucwords('kevin van zonneveld');
    // *     returns 1: 'Kevin Van Zonneveld'
    // *     example 2: ucwords('HELLO WORLD');
    // *     returns 2: 'HELLO WORLD'

    return (str+'').replace(/^(.)|\s(.)/g, function ( $1 ) { return $1.toUpperCase ( ); } );
}// }}}

// {{{ vprintf
function vprintf(format, args) {
    // Output a formatted string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_vprintf/
    // +       version: 902.122
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // +   improved by: Michael White (http://getsprink.com)
    // + reimplemented by: Brett Zamir
    // -    depends on: sprintf
    // *     example 1: printf("%01.2f", 123.1);
    // *     returns 1: 6

    var body, elmt;
    var ret = '';

    // .shift() does not work to get first item in bodies

    var HTMLNS = 'http://www.w3.org/1999/xhtml';
    body = document.getElementsByTagNameNS ?
      (document.getElementsByTagNameNS(HTMLNS, 'body')[0] ?
        document.getElementsByTagNameNS(HTMLNS, 'body')[0] :
        document.documentElement.lastChild) :
      document.getElementsByTagName('body')[0];

    if (!body) {
        return false;
    }

    ret = sprintf.apply(this, [format].concat(args));

    elmt = document.createTextNode(ret);
    body.appendChild(elmt);

    return ret.length;
}// }}}

// {{{ vsprintf
function vsprintf(format, args) {
    // Return a formatted string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_vsprintf/
    // +       version: 901.817
    // +   original by: ejsanders
    // -    depends on: sprintf
    // *     example 1: vsprintf('%04d-%02d-%02d', [1988, 8, 1]);
    // *     returns 1: '1988-08-01'

    return sprintf.apply(this, [format].concat(args));
}// }}}

// {{{ wordwrap
function wordwrap( str, int_width, str_break, cut ) {
    // Wraps a string to a given number of characters
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_wordwrap/
    // +       version: 810.819
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Nick Callen
    // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Sakimori
    // *     example 1: wordwrap('Kevin van Zonneveld', 6, '|', true);
    // *     returns 1: 'Kevin |van |Zonnev|eld'
    // *     example 2: wordwrap('The quick brown fox jumped over the lazy dog.', 20, '<br />\n');
    // *     returns 2: 'The quick brown fox <br />\njumped over the lazy<br />\n dog.'
    // *     example 3: wordwrap('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');
    // *     returns 3: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod \ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \nveniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea \ncommodo consequat.'

    // PHP Defaults
    var m = ((arguments.length >= 2) ? arguments[1] : 75   );
    var b = ((arguments.length >= 3) ? arguments[2] : "\n" );
    var c = ((arguments.length >= 4) ? arguments[3] : false);

    var i, j, l, s, r;

    str += '';

    if (m < 1) {
        return str;
    }

    for (i = -1, l = (r = str.split("\n")).length; ++i < l; r[i] += s) {
        for(s = r[i], r[i] = ""; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : "")){
            j = c == 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length || c == 1 && m || j.input.length + (j = s.slice(m).match(/^\S*/)).input.length;
        }
    }

    return r.join("\n");
}// }}}

// {{{ base64_decode
function base64_decode( data ) {
    // Decodes data encoded with MIME base64
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_base64_decode/
    // +       version: 810.819
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Thunder.m
    // +      input by: Aman Gupta
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // -    depends on: utf8_decode
    // *     example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
    // *     returns 1: 'Kevin van Zonneveld'

    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof window['btoa'] == 'function') {
    //    return btoa(data);
    //}

    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = ac = 0, dec = "", tmp_arr = [];

    data += '';

    do {  // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf(data.charAt(i++));
        h2 = b64.indexOf(data.charAt(i++));
        h3 = b64.indexOf(data.charAt(i++));
        h4 = b64.indexOf(data.charAt(i++));

        bits = h1<<18 | h2<<12 | h3<<6 | h4;

        o1 = bits>>16 & 0xff;
        o2 = bits>>8 & 0xff;
        o3 = bits & 0xff;

        if (h3 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1);
        } else if (h4 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1, o2);
        } else {
            tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
        }
    } while (i < data.length);

    dec = tmp_arr.join('');
    dec = utf8_decode(dec);

    return dec;
}// }}}

// {{{ base64_encode
function base64_encode( data ) {
    // Encodes data with MIME base64
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_base64_encode/
    // +       version: 809.522
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Bayron Guevara
    // +   improved by: Thunder.m
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)        
    // -    depends on: utf8_encode
    // *     example 1: base64_encode('Kevin van Zonneveld');
    // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='

    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof window['atob'] == 'function') {
    //    return atob(data);
    //}
        
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = ac = 0, enc="", tmp_arr = [];
    data = utf8_encode(data);
    
    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);
    
    enc = tmp_arr.join('');
    
    switch( data.length % 3 ){
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}// }}}

// {{{ get_headers
function get_headers(url, format) {
    // Fetches all the headers sent by the server in response to a HTTP request
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_get_headers/
    // +       version: 812.1017
    // +   original by: Paulo Ricardo F. Santos
    // %        note 1: This function uses XmlHttpRequest and cannot retrieve resource from different domain.
    // %        note 1: Synchronous so may lock up browser, mainly here for study purposes.
    // *     example 1: get_headers('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
    // *     returns 1: '123'
    
    var req = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
    if (!req) throw new Error('XMLHttpRequest not supported');
    var tmp, headers, pair, i;

    req.open('HEAD', url, false);
    req.send(null);

    if (req.readyState < 3) {
        return false;
    }

    tmp = req.getAllResponseHeaders();alert(tmp);
    tmp = tmp.split('\n');
    tmp = array_filter(tmp, function (value) { return value.substring(1) != ''; });
    headers = [req.status + ' ' + req.statusText];

    for (i in tmp) {
        if (format) {
            pair = tmp[i].split(':');
            headers[pair.splice(0, 1)] = pair.join(':').substring(1);
        } else {
            headers[headers.length] = tmp[i];
        }
    }

    return headers;
}// }}}

// @Wilflower: Error in IE7
// {{{ get_meta_tags
// function get_meta_tags(file) {
//     // Extracts all meta tag content attributes from a file and returns an array
//     // 
//     // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_get_meta_tags/
//     // +       version: 901.1411
//     // +   original by: Brett Zamir
//     // %        note 1: This function uses XmlHttpRequest and cannot retrieve resource from different domain.
//     // %        note 1: Synchronous so may lock up browser, mainly here for study purposes.
//     // -    depends on: file_get_contents
//     // *     example 1: get_meta_tags('http://kevin.vanzonneveld.net/pj_test_supportfile_2.htm');
//     // *     returns 1: {description: 'a php manual', author: 'name', keywords: 'php documentation', 'geo_position': '49.33;-86.59'}
// 
//     var fulltxt = '';
// 
//     if (false) {
//         // Use this for testing instead of the line above:
//         fulltxt = '<meta name="author" content="name">'+
//         '<meta name="keywords" content="php documentation">'+
//         '<meta name="DESCRIPTION" content="a php manual">'+
//         '<meta name="geo.position" content="49.33;-86.59">'+
//         '</head>';
//     } else {
//         fulltxt = file_get_contents(file).match(/^[^]*<\/head>/i);
//     }
//     
//     var patt = /<meta[^>]*?>/gim;
//     var patt1 = /<meta\s+.*?name\s*=\s*(['"]?)(.*?)\1\s+.*?content\s*=\s*(['"]?)(.*?)\3/gim;
//     var patt2 = /<meta\s+.*?content\s*=\s*(['"?])(.*?)\1\s+.*?name\s*=\s*(['"]?)(.*?)\3/gim;
//     var txt, match, name, arr={};
// 
//     while ((txt = patt.exec(fulltxt)) != null) {
//         while ((match = patt1.exec(txt)) != null) {
//             name = match[2].replace(/\W/g, '_').toLowerCase();
//             arr[name] = match[4];
//         }
//         while ((match = patt2.exec(txt)) != null) {
//             name = match[4].replace(/\W/g, '_').toLowerCase();
//             arr[name] = match[2];
//         }
//     }
//     return arr;
// }// }}}

// {{{ http_build_query
function http_build_query( formdata, numeric_prefix, arg_separator ) {
    // Generate URL-encoded query string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_http_build_query/
    // +       version: 809.2411
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Legaev Andrey
    // +   improved by: Michael White (http://getsprink.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: urlencode
    // *     example 1: http_build_query({foo: 'bar', php: 'hypertext processor', baz: 'boom', cow: 'milk'}, '', '&amp;');
    // *     returns 1: 'foo=bar&amp;php=hypertext+processor&amp;baz=boom&amp;cow=milk'
    // *     example 2: http_build_query({'php': 'hypertext processor', 0: 'foo', 1: 'bar', 2: 'baz', 3: 'boom', 'cow': 'milk'}, 'myvar_');
    // *     returns 2: 'php=hypertext+processor&myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&cow=milk'

    var key, use_val, use_key, i = 0, j=0, tmp_arr = [];

    if (!arg_separator) {
        arg_separator = '&';
    }

    for (key in formdata) {
        use_val = urlencode(formdata[key].toString());
        use_key = urlencode(key);

        if (numeric_prefix && !isNaN(key)) {
            use_key = numeric_prefix + j;
            j++;
        }
        tmp_arr[i++] = use_key + '=' + use_val;
    }

    return tmp_arr.join(arg_separator);
}// }}}

// {{{ parse_url
function parse_url (str, component) {
    // Parse a URL and return its components
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_parse_url/
    // +       version: 901.2514
    // +      original by: Steven Levithan (http://blog.stevenlevithan.com)
    // + reimplemented by: Brett Zamir
    // %          note: Based on http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
    // %          note: blog post at http://blog.stevenlevithan.com/archives/parseuri
    // %          note: demo at http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
    // %          note: Does not replace invaild characters with '_' as in PHP, nor does it return false with
    // %          note: a seriously malformed URL.
    // %          note: Besides function name, is the same as parseUri besides the commented out portion
    // %          note: and the additional section following, as well as our allowing an extra slash after
    // %          note: the scheme/protocol (to allow file:/// as in PHP)
    // *     example 1: parse_url('http://username:password@hostname/path?arg=value#anchor');
    // *     returns 1: {scheme: 'http', host: 'hostname', user: 'username', pass: 'password', path: '/path', query: 'arg=value', fragment: 'anchor'}

    var  o   = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {
            name:   "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-protocol to catch file:/// (should restrict this)
        }
    };
    
    var m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
    uri = {},
    i   = 14;
    while (i--) uri[o.key[i]] = m[i] || "";
    // Uncomment the following to use the original more detailed (non-PHP) script
    /*
        uri[o.q.name] = {};
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
        });
        return uri;
    */

    switch (component) {
        case 'PHP_URL_SCHEME':
            return uri.protocol;
        case 'PHP_URL_HOST':
            return uri.host;
        case 'PHP_URL_PORT':
            return uri.port;
        case 'PHP_URL_USER':
            return uri.user;
        case 'PHP_URL_PASS':
            return uri.password;
        case 'PHP_URL_PATH':
            return uri.path;
        case 'PHP_URL_QUERY':
            return uri.query;
        case 'PHP_URL_FRAGMENT':
            return uri.anchor;
        default:
            var retArr = {};
            if (uri.protocol !== '') retArr.scheme=uri.protocol;
            if (uri.host !== '') retArr.host=uri.host;
            if (uri.port !== '') retArr.port=uri.port;
            if (uri.user !== '') retArr.user=uri.user;
            if (uri.password !== '') retArr.pass=uri.password;
            if (uri.path !== '') retArr.path=uri.path;
            if (uri.query !== '') retArr.query=uri.query;
            if (uri.anchor !== '') retArr.fragment=uri.anchor;
            return retArr;
    }
}// }}}

// {{{ rawurldecode
function rawurldecode( str ) {
    // Decode URL-encoded strings
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_rawurldecode/
    // +       version: 901.1411
    // +   original by: Brett Zamir
    // *     example 1: rawurldecode('Kevin+van+Zonneveld%21');
    // *     returns 1: 'Kevin+van+Zonneveld!'
    // *     example 2: rawurldecode('http%3A%2F%2Fkevin.vanzonneveld.net%2F');
    // *     returns 2: 'http://kevin.vanzonneveld.net/'
    // *     example 3: rawurldecode('http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a');
    // *     returns 3: 'http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a'

    var histogram = {};
    var ret = str.toString(); 

    var replacer = function(search, replace, str) {
        var tmp_arr = [];
        tmp_arr = str.split(search);
        return tmp_arr.join(replace);
    };

    // The histogram is identical to the one in urlencode.
    histogram["'"]   = '%27';
    histogram['(']   = '%28';
    histogram[')']   = '%29';
    histogram['*']   = '%2A';
    histogram['~']   = '%7E';
    histogram['!']   = '%21';

    for (replace in histogram) {
        search = histogram[replace]; // Switch order when decoding
        ret = replacer(search, replace, ret) // Custom replace. No regexing
    }

    // End with decodeURIComponent, which most resembles PHP's encoding functions
    ret = decodeURIComponent(ret);

    return ret;
}// }}}

// {{{ rawurlencode
function rawurlencode( str ) {
    // URL-encode according to RFC 1738
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_rawurlencode/
    // +       version: 901.1411
    // +   original by: Brett Zamir
    // *     example 1: rawurlencode('Kevin van Zonneveld!');
    // *     returns 1: 'Kevin van Zonneveld%21'
    // *     example 2: rawurlencode('http://kevin.vanzonneveld.net/');
    // *     returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
    // *     example 3: rawurlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
    // *     returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'
 
    var histogram = {}, tmp_arr = [];
    var ret = str.toString();

    var replacer = function(search, replace, str) {
        var tmp_arr = [];
        tmp_arr = str.split(search);
        return tmp_arr.join(replace);
    };

    // The histogram is identical to the one in urldecode.
    histogram["'"]   = '%27';
    histogram['(']   = '%28';
    histogram[')']   = '%29';
    histogram['*']   = '%2A'; 
    histogram['~']   = '%7E';
    histogram['!']   = '%21';

    // Begin with encodeURIComponent, which most resembles PHP's encoding functions
    ret = encodeURIComponent(ret);

    // Restore spaces, converted by encodeURIComponent which is not rawurlencode compatible
    ret = replacer('%20', ' ', ret); // Custom replace. No regexing

    for (search in histogram) {
        replace = histogram[search];
        ret = replacer(search, replace, ret) // Custom replace. No regexing
    }

    // Uppercase for full PHP compatibility
    return ret.replace(/(\%([a-z0-9]{2}))/g, function(full, m1, m2) {
        return "%"+m2.toUpperCase();
    });

    return ret;
}// }}}

// {{{ urldecode
function urldecode( str ) {
    // Decodes URL-encoded string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_urldecode/
    // +       version: 901.1411
    // +   original by: Philip Peterson
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: AJ
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir
    // %          note: info on what encoding functions to use from: http://xkr.us/articles/javascript/encode-compare/
    // *     example 1: urldecode('Kevin+van+Zonneveld%21');
    // *     returns 1: 'Kevin van Zonneveld!'
    // *     example 2: urldecode('http%3A%2F%2Fkevin.vanzonneveld.net%2F');
    // *     returns 2: 'http://kevin.vanzonneveld.net/'
    // *     example 3: urldecode('http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a');
    // *     returns 3: 'http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a'
    
    var histogram = {};
    var ret = str.toString();
    
    var replacer = function(search, replace, str) {
        var tmp_arr = [];
        tmp_arr = str.split(search);
        return tmp_arr.join(replace);
    };
    
    // The histogram is identical to the one in urlencode.
    histogram["'"]   = '%27';
    histogram['(']   = '%28';
    histogram[')']   = '%29';
    histogram['*']   = '%2A';
    histogram['~']   = '%7E';
    histogram['!']   = '%21';
    histogram['%20'] = '+';

    for (replace in histogram) {
        search = histogram[replace]; // Switch order when decoding
        ret = replacer(search, replace, ret) // Custom replace. No regexing   
    }
    
    // End with decodeURIComponent, which most resembles PHP's encoding functions
    ret = decodeURIComponent(ret);

    return ret;
}// }}}

// {{{ urlencode
function urlencode( str ) {
    // URL-encodes string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_urlencode/
    // +       version: 901.1411
    // +   original by: Philip Peterson
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: AJ
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir
    // %          note: info on what encoding functions to use from: http://xkr.us/articles/javascript/encode-compare/
    // *     example 1: urlencode('Kevin van Zonneveld!');
    // *     returns 1: 'Kevin+van+Zonneveld%21'
    // *     example 2: urlencode('http://kevin.vanzonneveld.net/');
    // *     returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
    // *     example 3: urlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
    // *     returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'
                             
    var histogram = {}, tmp_arr = [];
    var ret = str.toString();
    
    var replacer = function(search, replace, str) {
        var tmp_arr = [];
        tmp_arr = str.split(search);
        return tmp_arr.join(replace);
    };
    
    // The histogram is identical to the one in urldecode.
    histogram["'"]   = '%27';
    histogram['(']   = '%28';
    histogram[')']   = '%29';
    histogram['*']   = '%2A';
    histogram['~']   = '%7E';
    histogram['!']   = '%21';
    histogram['%20'] = '+';
    
    // Begin with encodeURIComponent, which most resembles PHP's encoding functions
    ret = encodeURIComponent(ret);
    
    for (search in histogram) {
        replace = histogram[search];
        ret = replacer(search, replace, ret) // Custom replace. No regexing
    }
    
    // Uppercase for full PHP compatibility
    return ret.replace(/(\%([a-z0-9]{2}))/g, function(full, m1, m2) {
        return "%"+m2.toUpperCase();
    });
    
    return ret;
}// }}}

// {{{ doubleval
function doubleval( mixed_var ) {
    // Alias of floatval()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_doubleval/
    // +       version: 901.2515
    // +   original by: Brett Zamir
    //  -   depends on: floatval
    // %        note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
    // %        note 1: it different from the PHP implementation. We can't fix this unfortunately.
    // *     example 1: doubleval(186);
    // *     returns 1: 186.00

    return floatval(mixed_var);
}// }}}

// {{{ empty
function empty( mixed_var ) {
    // Determine whether a variable is empty
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_empty/
    // +       version: 811.1314
    // +   original by: Philippe Baumann
    // +      input by: Onno Marsman
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: LH
    // +   improved by: Onno Marsman
    // +   improved by: Francesco
    // *     example 1: empty(null);
    // *     returns 1: true
    // *     example 2: empty(undefined);
    // *     returns 2: true
    // *     example 3: empty([]);
    // *     returns 3: true
    // *     example 4: empty({});
    // *     returns 4: true
    
    var key;
    
    if (mixed_var === ""
        || mixed_var === 0
        || mixed_var === "0"
        || mixed_var === null
        || mixed_var === false
        || mixed_var === undefined
    ){
        return true;
    }
    if (typeof mixed_var == 'object') {
        for (key in mixed_var) {
            if (typeof mixed_var[key] !== 'function' ) {
	            return false;
            }
        }
        return true;
    }
    return false;
}// }}}

// {{{ floatval
function floatval(mixed_var) {
    // +   original by: Michael White (http://getsprink.com)
    // %        note 1: The native parseFloat() method of JavaScript returns NaN when it encounters a string before an int or float value.
    // *     example 1: floatval('150.03_page-section');
    // *     returns 1: 150.03
    // *     example 2: floatval('page: 3');
    // *     returns 2: 0
    // *     example 2: floatval('-50 + 8');
    // *     returns 2: -50

    return (parseFloat(mixed_var) || 0);
}// }}}

// {{{ get_defined_vars
function get_defined_vars() {
    // Returns an array of all defined variables
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_get_defined_vars/
    // +       version: 812.3015
    // +   original by: Brett Zamir
    // %        note 1: Test case 1: If get_defined_vars can find itself in the defined vars, it worked :)
    // *     example 1: function test_in_array(array, p_val) {for(var i = 0, l = array.length; i < l; i++) {if(array[i] == p_val) return true;} return false;}
    // *     example 1: funcs = get_defined_vars();
    // *     example 1: found = test_in_array(funcs, 'get_defined_vars');
    // *     results 1: found == true

    var i = '', arr = [], already = {};

    for (i in window) {
        try {
            if (typeof window[i] === 'function') {
                if (!already[i]) {
                    already[i] = 1;
                    arr.push(i);
                }
            }
            else if (typeof window[i] === 'object') {
                for (var j in window[i]) {
                    if (typeof window[j] === 'function' && window[j] && !already[j]) {
                        already[j] = 1;
                        arr.push(j);
                    }
                }
            }
        }
        catch (e) {

        }
    }

    return arr;
}// }}}

// {{{ gettype
function gettype( mixed_var ) {
    // Get the type of a variable
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_gettype/
    // +       version: 812.3015
    // +   original by: Paulo Ricardo F. Santos
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Douglas Crockford (http://javascript.crockford.com)
    // -    depends on: is_float
    // -    depends on: is_array
    // -    depends on: is_object
    // %        note 1: lacks resource type
    // %        note 2: 1.0 is simplified to 1 before it can be accessed by the function, this makes
    // %        note 21: it different from the PHP implementation. We can't fix this unfortunately.
    // *     example 1: gettype(1);
    // *     returns 1: 'integer'
    // *     example 2: gettype(undefined);
    // *     returns 2: 'undefined'
    // *     example 3: gettype({0: 'Kevin van Zonneveld'});
    // *     returns 3: 'array'
    // *     example 4: gettype('foo');
    // *     returns 4: 'string'
    // *     example 5: gettype({0: function () {return false;}});
    // *     returns 5: 'array'

    var type;

    var typeOf = function (value) {
        // From: http://javascript.crockford.com/remedial.html
        var s = typeof value;
        if (s === 'object') {
            if (value) {
                if (typeof value.length === 'number' &&
                        !(value.propertyIsEnumerable('length')) &&
                        typeof value.splice === 'function') {
                    s = 'array';
                }
            } else {
                s = 'null';
            }
        }
        return s;
    }

    switch (type = typeOf(mixed_var)) {
        case 'number':
            return (is_float(mixed_var)) ? 'double' : 'integer';
            break;
        case 'object':
        case 'array':
            if (is_array(mixed_var)) {
                return 'array';
            } else if (is_object(mixed_var)) {
                return 'object';
            }
            break;
    }

    return type;
}// }}}

// {{{ import_request_variables
function import_request_variables (types, prefix) {
    // Import GET/POST/Cookie variables into the global scope
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_import_request_variables/
    // +       version: 902.123
    // +      original by: Jalal Berrami
    // + reimplemented by: Brett Zamir
    // *        example 1: document.cookie = 'snack=yummy';
    // *        example 1: import_request_variables('gc', 'pr_');
    // *        results 1: pr_snack == 'yummy'

    var i = 0, current = '', url = '', vars = '';
    prefix = prefix || '';

    if (/g/i.test(types)) { // GET
        for(i = 0, url = window.location.href, vars = url.substring(url.lastIndexOf("?") + 1, url.length).split("&"); i < vars.length;i++){
            current = vars[i].split("=");
            window[prefix+current[0]] = current[1] || null;
        }
    }
    if (/c/i.test(types)) { // COOKIE
        for(i = 0, vars = document.cookie.split("&"); i < vars.length;i++){
            current = vars[i].split("=");
            window[prefix+current[0]] = current[1].split(";")[0] || null;
        }
    }
}// }}}

// {{{ intval
function intval( mixed_var, base ) {
    // Get the integer value of a variable
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_intval/
    // +       version: 812.3015
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: stensi
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: intval('Kevin van Zonneveld');
    // *     returns 1: 0
    // *     example 2: intval(4.2);
    // *     returns 2: 4
    // *     example 3: intval(42, 8);
    // *     returns 3: 42
    // *     example 4: intval('09');
    // *     returns 4: 9

    var tmp;

    var type = typeof( mixed_var );

    if(type == 'boolean'){
        if (mixed_var == true) {
            return 1;
        } else {
            return 0;
        }
    } else if(type == 'string'){
        tmp = parseInt(mixed_var * 1);
        if(isNaN(tmp) || !isFinite(tmp)){
            return 0;
        } else{
            return tmp.toString(base || 10);
        }
    } else if(type == 'number' && isFinite(mixed_var) ){
        return Math.floor(mixed_var);
    } else{
        return 0;
    }
}// }}}

// {{{ is_array
function is_array( mixed_var ) {
    // Finds whether a variable is an array
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_array/
    // +       version: 901.1623
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Legaev Andrey
    // +   bugfixed by: Cord
    // +   bugfixed by: Manish
    // +   improved by: Onno Marsman
    // %        note 1: In php.js, javascript objects are like php associative arrays, thus JavaScript objects will also
    // %        note 1: return true
    // *     example 1: is_array(['Kevin', 'van', 'Zonneveld']);
    // *     returns 1: true
    // *     example 2: is_array('Kevin van Zonneveld');
    // *     returns 2: false
    // *     example 3: is_array({0: 'Kevin', 1: 'van', 2: 'Zonneveld'});
    // *     returns 3: true
    // *     example 4: is_array(function tmp_a(){this.name = 'Kevin'});
    // *     returns 4: false

    var key = '';

    if (!mixed_var) {
        return false;
    }

    if (typeof mixed_var === 'object') {

        if (mixed_var.hasOwnProperty) {
            for (key in mixed_var) {
                // Checks whether the object has the specified property
                // if not, we figure it's not an object in the sense of a php-associative-array.
                if (false === mixed_var.hasOwnProperty(key)) {
                    return false;
                }
            }
        }

        // Uncomment to enable strict JavsScript-proof type checking
        // This will not support PHP associative arrays (JavaScript objects), however
        // Read discussion at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_array/
        //
        //  if (mixed_var.propertyIsEnumerable('length') || typeof mixed_var.length !== 'number') {
        //      return false;
        //  }

        return true;
    }

    return false;
}// }}}

// {{{ is_bool
function is_bool(mixed_var)
{
    // Finds out whether a variable is a boolean
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_bool/
    // +       version: 810.915
    // +   original by: Onno Marsman
    // *     example 1: is_bool(false);
    // *     returns 1: true
    // *     example 2: is_bool(0);
    // *     returns 2: false

    return (typeof mixed_var == 'boolean');
}// }}}

// {{{ is_callable
function is_callable (v, syntax_only, callable_name) {
    // Verify that the contents of a variable can be called as a function
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_callable/
    // +       version: 902.821
    // +   original by: Brett Zamir
    // %        note 1: The variable callable_name cannot work as a string variable passed by reference as in PHP (since JavaScript does not support passing strings by reference), but instead will take the name of a global variable and set that instead
    // %        note 2: When used on an object, depends on a constructor property being kept on the object prototype
    // *     example 1: is_callable('is_callable');
    // *     returns 1: true
    // *     example 2: is_callable('bogusFunction', true);
    // *     returns 2:true // gives true because does not do strict checking
    // *     example 3: function SomeClass () {}
    // *     example 3: SomeClass.prototype.someMethod = function(){};
    // *     example 3: var testObj = new SomeClass();
    // *     example 3: is_callable([testObj, 'someMethod'], true, 'myVar');
    // *     example 3: alert(myVar); // 'SomeClass::someMethod'
    var name='', obj={}, method='';
    if (typeof v === 'string') {
        obj = window;
        method = v;
        name = v;
    }
    else if (v instanceof Array && v.length === 2 && typeof v[0] === 'object' && typeof v[1] === 'string') {
        obj = v[0];
        method = v[1];
        name = (obj.constructor && obj.constructor.name)+'::'+method;
    }
    else {
        return false;
    }
    if (syntax_only || typeof obj[method] === 'function') {
        if (callable_name) {
        window[callable_name] = name;
        }
        return true;
    }
    return false;
}// }}}

// {{{ is_double
function is_double( mixed_var ) {
    // Alias of is_float()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_double/
    // +       version: 812.1017
    // +   original by: Paulo Ricardo F. Santos
    //  -   depends on: is_float
    // %        note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
    // %        note 1: it different from the PHP implementation. We can't fix this unfortunately.
    // *     example 1: is_double(186.31);
    // *     returns 1: true

    return is_float(mixed_var);
}// }}}

// {{{ is_float
function is_float( mixed_var ) {
    // Finds whether the type of a variable is float
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_float/
    // +       version: 812.1017
    // +   original by: Paulo Ricardo F. Santos
    // %        note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
    // %        note 1: it different from the PHP implementation. We can't fix this unfortunately.
    // *     example 1: is_float(186.31);
    // *     returns 1: true

    return parseFloat(mixed_var * 1) != parseInt(mixed_var * 1);
}// }}}

// {{{ is_int
function is_int( mixed_var ) {
    // Find whether the type of a variable is integer
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_int/
    // +       version: 901.2514
    // +   original by: Alex
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Matt Bradley
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // %        note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
    // %        note 1: it different from the PHP implementation. We can't fix this unfortunately.
    // *     example 1: is_int(23)
    // *     returns 1: true
    // *     example 2: is_int('23')
    // *     returns 2: false
    // *     example 3: is_int(23.5)
    // *     returns 3: false
    // *     example 4: is_int(true)
    // *     returns 4: false

    if (typeof mixed_var !== 'number') {
        return false;
    }

    if (parseFloat(mixed_var) != parseInt(mixed_var)) {
        return false;
    }
    
    return true;
}// }}}

// {{{ is_integer
function is_integer( mixed_var ) {
    // Alias of is_int()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_integer/
    // +       version: 812.1017
    // +   original by: Paulo Ricardo F. Santos
    //  -   depends on: is_int
    // %        note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
    // %        note 1: it different from the PHP implementation. We can't fix this unfortunately.
    // *     example 1: is_integer(186.31);
    // *     returns 1: false
    // *     example 2: is_integer(12);
    // *     returns 2: true

    return is_int(mixed_var);
}// }}}

// {{{ is_long
function is_long( mixed_var ) {
    // Alias of is_int()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_long/
    // +       version: 812.1017
    // +   original by: Paulo Ricardo F. Santos
    //  -   depends on: is_float
    // %        note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
    // %        note 1: it different from the PHP implementation. We can't fix this unfortunately.
    // *     example 1: is_long(186.31);
    // *     returns 1: true

    return is_float(mixed_var);
}// }}}

// {{{ is_null
function is_null( mixed_var ){
    // Finds whether a variable is NULL
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_null/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: is_null('23');
    // *     returns 1: false
    // *     example 2: is_null(null);
    // *     returns 2: true

    return ( mixed_var === null );
}// }}}

// {{{ is_numeric
function is_numeric( mixed_var ) {
    // Finds whether a variable is a number or a numeric string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_numeric/
    // +       version: 902.223
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: David
    // +   improved by: taith
    // *     example 1: is_numeric(186.31);
    // *     returns 1: true
    // *     example 2: is_numeric('Kevin van Zonneveld');
    // *     returns 2: false
    // *     example 3: is_numeric('+186.31e2');
    // *     returns 3: true

    return !isNaN(mixed_var * 1);
}// }}}

// {{{ is_object
function is_object( mixed_var ){
    // Finds whether a variable is an object
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_object/
    // +       version: 809.2411
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Legaev Andrey
    // +   improved by: Michael White (http://getsprink.com)
    // *     example 1: is_object('23');
    // *     returns 1: false
    // *     example 2: is_object({foo: 'bar'});
    // *     returns 2: true
    // *     example 3: is_object(null);
    // *     returns 3: false

    if(mixed_var instanceof Array) {
        return false;
    } else {
        return (mixed_var !== null) && (typeof( mixed_var ) == 'object');
    }
}// }}}

// {{{ is_real
function is_real( mixed_var ) {
    // Alias of is_float()
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_real/
    // +       version: 901.2515
    // +   original by: Brett Zamir
    //  -   depends on: is_float
    // %        note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
    // %        note 1: it different from the PHP implementation. We can't fix this unfortunately.
    // *     example 1: is_double(186.31);
    // *     returns 1: true

    return is_float(mixed_var);
}// }}}

// {{{ is_scalar
function is_scalar( mixed_var ) {
    // Finds whether a variable is a scalar
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_scalar/
    // +       version: 812.1017
    // +   original by: Paulo Ricardo F. Santos
    // *     example 1: is_scalar(186.31);
    // *     returns 1: true
    // *     example 2: is_scalar({0: 'Kevin van Zonneveld'});
    // *     returns 2: false

    return /boolean|number|string/.test(typeof mixed_var);
}// }}}

// {{{ is_string
function is_string( mixed_var ){
    // Find whether the type of a variable is string
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_is_string/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: is_string('23');
    // *     returns 1: true
    // *     example 2: is_string(23.5);
    // *     returns 2: false

    return (typeof( mixed_var ) == 'string');
}// }}}

// {{{ isset
function isset(  ) {
    // Determine whether a variable is set
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_isset/
    // +       version: 809.522
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: FremyCompany
    // +   improved by: Onno Marsman
    // *     example 1: isset( undefined, true);
    // *     returns 1: false
    // *     example 2: isset( 'Kevin van Zonneveld' );
    // *     returns 2: true
    
    var a=arguments; var l=a.length; var i=0;
    
    if (l==0) { 
        throw new Error('Empty isset'); 
    }
    
    while (i!=l) {
        if (typeof(a[i])=='undefined' || a[i]===null) { 
            return false; 
        } else { 
            i++; 
        }
    }
    return true;
}// }}}

// {{{ print_r
function print_r( array, return_val ) {
    // Prints human-readable information about a variable
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_print_r/
    // +       version: 809.2411
    // +   original by: Michael White (http://getsprink.com)
    // +   improved by: Ben Bryan
    // *     example 1: print_r(1, true);
    // *     returns 1: 1
    
    var output = "", pad_char = " ", pad_val = 4;

    var formatArray = function (obj, cur_depth, pad_val, pad_char) {
        if (cur_depth > 0) {
            cur_depth++;
        }

        var base_pad = repeat_char(pad_val*cur_depth, pad_char);
        var thick_pad = repeat_char(pad_val*(cur_depth+1), pad_char);
        var str = "";

        if (obj instanceof Array || obj instanceof Object) {
            str += "Array\n" + base_pad + "(\n";
            for (var key in obj) {
                if (obj[key] instanceof Array) {
                    str += thick_pad + "["+key+"] => "+formatArray(obj[key], cur_depth+1, pad_val, pad_char);
                } else {
                    str += thick_pad + "["+key+"] => " + obj[key] + "\n";
                }
            }
            str += base_pad + ")\n";
        } else if(obj == null || obj == undefined) {
            str = '';
        } else {
            str = obj.toString();
        }

        return str;
    };

    var repeat_char = function (len, pad_char) {
        var str = "";
        for(var i=0; i < len; i++) { 
            str += pad_char; 
        };
        return str;
    };
    output = formatArray(array, 0, pad_val, pad_char);

    if (return_val !== true) {
        document.write("<pre>" + output + "</pre>");
        return true;
    } else {
        return output;
    }
}// }}}

// {{{ serialize
function serialize( mixed_value ) {
    // Generates a storable representation of a value
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_serialize/
    // +       version: 812.3015
    // +   original by: Arpad Ray (mailto:arpad@php.net)
    // +   improved by: Dino
    // +   bugfixed by: Andrej Pavlovic
    // +   bugfixed by: Garagoth
    // %          note: We feel the main purpose of this function should be to ease the transport of data between php & js
    // %          note: Aiming for PHP-compatibility, we have to translate objects to arrays
    // *     example 1: serialize(['Kevin', 'van', 'Zonneveld']);
    // *     returns 1: 'a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}'
    // *     example 2: serialize({firstName: 'Kevin', midName: 'van', surName: 'Zonneveld'});
    // *     returns 2: 'a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}'

    var _getType = function( inp ) {
        var type = typeof inp, match;
        var key;
        if (type == 'object' && !inp) {
            return 'null';
        }
        if (type == "object") {
            if (!inp.constructor) {
                return 'object';
            }
            var cons = inp.constructor.toString();
            if (match = cons.match(/(\w+)\(/)) {
                cons = match[1].toLowerCase();
            }
            var types = ["boolean", "number", "string", "array"];
            for (key in types) {
                if (cons == types[key]) {
                    type = types[key];
                    break;
                }
            }
        }
        return type;
    };
    var type = _getType(mixed_value);
    var val, ktype = '';
    
    switch (type) {
        case "function": 
            val = ""; 
            break;
        case "undefined":
            val = "N";
            break;
        case "boolean":
            val = "b:" + (mixed_value ? "1" : "0");
            break;
        case "number":
            val = (Math.round(mixed_value) == mixed_value ? "i" : "d") + ":" + mixed_value;
            break;
        case "string":
            val = "s:" + mixed_value.length + ":\"" + mixed_value + "\"";
            break;
        case "array":
        case "object":
            val = "a";
            /*
            if (type == "object") {
                var objname = mixed_value.constructor.toString().match(/(\w+)\(\)/);
                if (objname == undefined) {
                    return;
                }
                objname[1] = serialize(objname[1]);
                val = "O" + objname[1].substring(1, objname[1].length - 1);
            }
            */
            var count = 0;
            var vals = "";
            var okey;
            var key;
            for (key in mixed_value) {
                ktype = _getType(mixed_value[key]);
                if (ktype == "function") { 
                    continue; 
                }
                
                okey = (key.match(/^[0-9]+$/) ? parseInt(key) : key);
                vals += serialize(okey) +
                        serialize(mixed_value[key]);
                count++;
            }
            val += ":" + count + ":{" + vals + "}";
            break;
    }
    if (type != "object" && type != "array") val += ";";
    return val;
}// }}}

// {{{ settype
function settype (vr, type) {
   // http://kevin.vanzonneveld.net
    // +   original by: Waldo Malqui Silva
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Brett Zamir
    // %        note 1: Credits to Crockford also
    // %        note 2: only works on global variables, and "vr" must be passed in as a string
    // *     example 1: foo = '5bar';
    // *     example 1: settype(foo, 'integer');
    // *     results 1: foo == 5
    // *     returns 1: true
    // *     example 2: foo = true;
    // *     example 2: settype(foo, 'string');
    // *     results 2: foo == '1'
    // *     returns 2: true

    var is_array = function (arr) {
        return typeof arr === 'object' && typeof arr.length === 'number' &&
                    !(arr.propertyIsEnumerable('length')) &&
                    typeof arr.splice === 'function';
    };
    var v, mtch, i, obj;
    v = this[vr] ? this[vr] : vr;
    
    try {
        switch(type) {
            case 'boolean':
                if (is_array(v) && v.length === 0) {this[vr]=false;}
                else if (v === '0') {this[vr]=false;}
                else if (typeof v === 'object' && !is_array(v)) {
                    var lgth = false;
                    for (i in v) {
                        lgth = true;
                    }
                    this[vr]=lgth;
                }
                else {this[vr] = !!v;}
                break;
            case 'integer':
                if (typeof v === 'number') {this[vr]=parseInt(v, 10);}
                else if (typeof v === 'string') {
                    mtch = v.match(/^([+-]?)(\d+)/);
                    if (!mtch) {this[vr]=0;}
                    else {this[vr]=parseInt(v, 10);}
                }
                else if (v === true) {this[vr]=1;}
                else if (v === false || v === null) {this[vr]=0;}
                else if (is_array(v) && v.length === 0) {this[vr]=0;}
                else if (typeof v === 'object') {this[vr]=1;}

                break;
            case 'float':
                if (typeof v === 'string') {
                    mtch = v.match(/^([+-]?)(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?/);
                    if (!mtch) {this[vr]=0;}
                    else {this[vr]=parseFloat(v, 10);}
                }
                else if (v === true) {this[vr]=1;}
                else if (v === false || v === null) {this[vr]=0;}
                else if (is_array(v) && v.length === 0) {this[vr]=0;}
                else if (typeof v === 'object') {this[vr]=1;}
                break;
            case 'string':
                if (v === null || v === false) {this[vr]='';}
                else if (is_array(v)) {this[vr]='Array';}
                else if (typeof v === 'object') {this[vr]='Object';}
                else if (v === true) {this[vr]='1';}
                else {this[vr] += '';} // numbers (and functions?)
                break;
            case 'array':
                if (v === null) {this[vr] = [];}
                else if (typeof v !== 'object') {this[vr] = [v];}
                break;
            case 'object':
                if (v === null) {this[vr]={};}
                else if (is_array(v)) {
                    for (i = 0, obj={}; i < v.length; i++) {
                        obj[i] = v;
                    }
                    this[vr] = obj;
                }
                else if (typeof v !== 'object') {this[vr]={scalar:v};}
                break;
            case 'null':
                delete this[vr];
                break;
        }
        return true;
    } catch (e) {
        return false;
    }
}// }}}

// {{{ strval
function strval(str) {
    // Get string value of a variable
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_strval/
    // +       version: 901.1316
    // +   original by: Brett Zamir
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Brett Zamir
    // %        note 1: Comment out the entire switch if you want JS-like behavior instead of PHP behavior
    // -    depends on: gettype
    // *     example 1: strval({red: 1, green: 2, blue: 3, white: 4});
    // *     returns 1: 'Array'

    var type = '';

    if (str === null) return '';

    type = gettype(str);
    switch (type) {
        case 'boolean':
            if (str === true) return '1';
            return '';
        case 'array':
            return 'Array';
        case 'object':
            return 'Object';
    }
    
    return str;
}// }}}

// {{{ unserialize
function unserialize(data){
    // Creates a PHP value from a stored representation
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_unserialize/
    // +       version: 809.2122
    // +     original by: Arpad Ray (mailto:arpad@php.net)
    // +     improved by: Pedro Tainha (http://www.pedrotainha.com)
    // +     bugfixed by: dptr1988
    // +      revised by: d3x
    // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // %            note: We feel the main purpose of this function should be to ease the transport of data between php & js
    // %            note: Aiming for PHP-compatibility, we have to translate objects to arrays 
    // *       example 1: unserialize('a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}');
    // *       returns 1: ['Kevin', 'van', 'Zonneveld']
    // *       example 2: unserialize('a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}');
    // *       returns 2: {firstName: 'Kevin', midName: 'van', surName: 'Zonneveld'}
    
    var error = function (type, msg, filename, line){throw new window[type](msg, filename, line);};
    var read_until = function (data, offset, stopchr){
        var buf = [];
        var chr = data.slice(offset, offset + 1);
        var i = 2;
        while(chr != stopchr){
            if((i+offset) > data.length){
                error('Error', 'Invalid');
            }
            buf.push(chr);
            chr = data.slice(offset + (i - 1),offset + i);
            i += 1;
        }
        return [buf.length, buf.join('')];
    };
    var read_chrs = function (data, offset, length){
        buf = [];
        for(var i = 0;i < length;i++){
            var chr = data.slice(offset + (i - 1),offset + i);
            buf.push(chr);
        }
        return [buf.length, buf.join('')];
    };
    var _unserialize = function (data, offset){
        if(!offset) offset = 0;
        var buf = [];
        var dtype = (data.slice(offset, offset + 1)).toLowerCase();
        
        var dataoffset = offset + 2;
        var typeconvert = new Function('x', 'return x');
        var chrs = 0;
        var datalength = 0;
        
        switch(dtype){
            case "i":
                typeconvert = new Function('x', 'return parseInt(x)');
                var readData = read_until(data, dataoffset, ';');
                var chrs = readData[0];
                var readdata = readData[1];
                dataoffset += chrs + 1;
            break;
            case "b":
                typeconvert = new Function('x', 'return (parseInt(x) == 1)');
                var readData = read_until(data, dataoffset, ';');
                var chrs = readData[0];
                var readdata = readData[1];
                dataoffset += chrs + 1;
            break;
            case "d":
                typeconvert = new Function('x', 'return parseFloat(x)');
                var readData = read_until(data, dataoffset, ';');
                var chrs = readData[0];
                var readdata = readData[1];
                dataoffset += chrs + 1;
            break;
            case "n":
                readdata = null;
            break;
            case "s":
                var ccount = read_until(data, dataoffset, ':');
                var chrs = ccount[0];
                var stringlength = ccount[1];
                dataoffset += chrs + 2;
                
                var readData = read_chrs(data, dataoffset+1, parseInt(stringlength));
                var chrs = readData[0];
                var readdata = readData[1];
                dataoffset += chrs + 2;
                if(chrs != parseInt(stringlength) && chrs != readdata.length){
                    error('SyntaxError', 'String length mismatch');
                }
            break;
            case "a":
                var readdata = {};
                
                var keyandchrs = read_until(data, dataoffset, ':');
                var chrs = keyandchrs[0];
                var keys = keyandchrs[1];
                dataoffset += chrs + 2;
                
                for(var i = 0;i < parseInt(keys);i++){
                    var kprops = _unserialize(data, dataoffset);
                    var kchrs = kprops[1];
                    var key = kprops[2];
                    dataoffset += kchrs;
                    
                    var vprops = _unserialize(data, dataoffset);
                    var vchrs = vprops[1];
                    var value = vprops[2];
                    dataoffset += vchrs;
                    
                    readdata[key] = value;
                }
                
                dataoffset += 1;
            break;
            default:
                error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
            break;
        }
        return [dtype, dataoffset - offset, typeconvert(readdata)];
    };
    return _unserialize(data, 0)[2];
}// }}}

// {{{ var_export
function var_export(mixed_expression, bool_return) {
    // Outputs or returns a parsable string representation of a variable
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_var_export/
    // +       version: 809.522
    // +   original by: Philip Peterson
    // +   improved by: johnrembo
    // -    depends on: echo
    // *     example 1: var_export(null);
    // *     returns 1: null
    // *     example 2: var_export({0: 'Kevin', 1: 'van', 2: 'Zonneveld'}, true);
    // *     returns 2: "array (\n  0 => 'Kevin',\n  1 => 'van',\n  2 => 'Zonneveld'\n)"
    // *     example 3: data = 'Kevin';
    // *     example 3: var_export(data, true);
    // *     returns 3: "'Kevin'"

    var retstr = "";
    var iret = "";
    var cnt = 0;
    var x = [];
    
    var __getType = function( inp ) {
        var type = typeof inp, match;
        if (type == 'object' && !inp) {
            return 'null';
        }
        if (type == "object") {
            if (!inp.constructor) {
                return 'object';
            }
            var cons = inp.constructor.toString();
            if (match = cons.match(/(\w+)\(/)) {
                cons = match[1].toLowerCase();
            }
            var types = ["boolean", "number", "string", "array"];
            for (key in types) {
                if (cons == types[key]) {
                    type = types[key];
                    break;
                }
            }
        }
        return type;
    };
    var type = __getType(mixed_expression);
    
    if( type === null) {
        retstr = "NULL";
    } else if(type == 'array' || type == 'object') {
        for(i in mixed_expression) {
            x[cnt++] = var_export(i,true)+" => "+var_export(mixed_expression[i], true);
        }
        iret = x.join(',\n  ');
        retstr = "array (\n  "+iret+"\n)";
    } else {
        retstr = (!isNaN( mixed_expression )) ? mixed_expression : "'" + mixed_expression.replace('/(["\'\])/g', "\\$1").replace('/\0/g', "\\0") + "'";
    }
    
    if(bool_return != true) {
        echo(retstr);
        return null;
    } else {
        return retstr;
    }
}// }}}

// {{{ utf8_decode
function utf8_decode ( str_data ) {
    // Converts a string with ISO-8859-1 characters encoded with UTF-8   to single-byte
    // ISO-8859-1
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_utf8_decode/
    // +       version: 810.621
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +      input by: Aman Gupta
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Norman "zEh" Fuchs
    // +   bugfixed by: hitwork
    // +   bugfixed by: Onno Marsman
    // *     example 1: utf8_decode('Kevin van Zonneveld');
    // *     returns 1: 'Kevin van Zonneveld'

    var tmp_arr = [], i = ac = c1 = c2 = c3 = 0;

    str_data += '';

    while ( i < str_data.length ) {
        c1 = str_data.charCodeAt(i);
        if (c1 < 128) {
            tmp_arr[ac++] = String.fromCharCode(c1);
            i++;
        } else if ((c1 > 191) && (c1 < 224)) {
            c2 = str_data.charCodeAt(i+1);
            tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = str_data.charCodeAt(i+1);
            c3 = str_data.charCodeAt(i+2);
            tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }

    return tmp_arr.join('');
}// }}}

// {{{ utf8_encode
function utf8_encode ( string ) {
    // Encodes an ISO-8859-1 string to UTF-8
    // 
    // +    discuss at: http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_utf8_encode/
    // +       version: 811.1414
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: sowberry
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // +   improved by: Yves Sucaet
    // +   bugfixed by: Onno Marsman
    // *     example 1: utf8_encode('Kevin van Zonneveld');
    // *     returns 1: 'Kevin van Zonneveld'

    string = (string+'').replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    var utftext = "";
    var start, end;
    var stringl = 0;

    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
            end++;
        } else if((c1 > 127) && (c1 < 2048)) {
            enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
        } else {
            enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
        }
        if (enc != null) {
            if (end > start) {
                utftext += string.substring(start, end);
            }
            utftext += enc;
            start = end = n+1;
        }
    }

    if (end > start) {
        utftext += string.substring(start, string.length);
    }

    return utftext;
}// }}}

$.jlm.component('ButtonDisabler', '*', function() {
    
    $('.save-section input').click(function() {
        //$(this).attr('disabled', 'disabled').val('Saving...');
        return true;
    }).removeAttr('disabled');
    
});
$.jlm.component('EditButtons', 'posts.admin_edit, posts.admin_categorize, pages.admin_edit', function() {
    
    // Save buttons
    $('#save-draft input, #save-publish input').click(editButtonsOnClick);
    
    function editButtonsOnClick() {
        buttonEl = $(this);
        var originalLabel = buttonEl.attr('value');
        buttonEl.attr('value', 'Saving...').attr('disabled', 'disabled');
        
        var isPublish = (buttonEl.parent().attr('id') == 'save-publish');
        if (isPublish) {
            $('#PageDraft, #PostDraft').val('0');
        }
        
        // Do AJAX save
        // Save content back to textareas
        tinyMCE.triggerSave();

        // Do AJAX form submit
        var successCallback = function(json) {
            buttonEl.attr('value', originalLabel).removeAttr('disabled');

            // Update post info
            $('.post-info').html(json['post-info']).effect('highlight', {}, 4000);
            
            // Update buttons
            $('#edit-buttons').html(json['edit-buttons']);
            
            // Rebind
            $('.submit input').click(editButtonsOnClick);
        };
        
        var errorCallback = function(data) {
            alert('Error while saving. Check FireBug console for debug data.');
            if (typeof(console) == 'object') {
                console.debug(data);
            }
            buttonEl.attr('value', originalLabel).removeAttr('disabled');
        }
        
        var formEl = buttonEl.parents('form').eq(0);
        formEl.ajaxSubmit({ dataType: 'json', success: successCallback, error: errorCallback });
        
        return false;
    }
    
});
$.jlm.addComponent('inplaceEdit', {

    startup: function() {
        this.targetEl = $('.inplace-edit');
        var t = this;
        var edit = function() {
            var entryEl = $(this);
            // If link triggers the action
            if (entryEl.attr('href')) {
                entryEl = entryEl.parent().parent().parent().children('.entry');
            }
            var elHeight = entryEl.height();
            var elWidth = entryEl.width();
            var commentId = entryEl.parent().parent('li').attr('id').split('-');
            commentId = commentId[1];

            var respond = function(json) {
                // Hide comment action
                var commentActionsEl = $('.comment-actions', entryEl.parent());
                commentActionsEl.hide();

                var content = json.content;
                var formEl = $($.jlm.template('elements/edit_comment', { commentId: commentId }));
                entryEl.hide().before(formEl);
                var textareaEl = $('textarea', formEl);
                textareaEl.css({ width: elWidth, height: elHeight }).val(content);

                // Cancel button
                var cancel = function() {
                    formEl.remove();
                    entryEl.show();
                    commentActionsEl.show();
                    return false;
                };
                $('.cancel-edit-comment', formEl).click(cancel);

                // AJAX form
                var afterSave = function(contentHtml) {
                    cancel();
                    entryEl.html(contentHtml);
                };

                formEl.ajaxForm(afterSave);
            }

            var url = $.jlm.base + '/wf/comments/get_content/' + commentId;
            var content = $.post(url, respond, {}, 'json');
            return false;
        };
        this.targetEl.dblclick(edit);
        $('.edit-comment').click(edit);

        // Bind spam buttons...
        $('.spam-comment').click(this.markAsSpam);

        // ...delete buttons...
        $('.delete-comment').click(this.deleteComment);

        // ...not spam buttons ehm links.
        $('.unspam-comment').click(this.notSpam);
    },

    deleteComment: function() {
        var commentEl = $(this).parent().parent().parent();

        var commentId = commentEl.attr('id').split('-');
        commentId = commentId[1];
        var url = $.jlm.base + '/admin/comments/delete';
        var data = { 'data[Comment][id]': commentId };
        $.post(url, data);

        // Ask if sure
        var proceed = confirm('Do you really want to delete this comment?');
        if (!proceed) {
            return false;
        }

        // Animate
        commentEl.hide("puff", {}, 400, function() { $(this).remove() });
    },

    markAsSpam: function() {
        var commentEl = $(this).parent().parent().parent();

        var commentId = commentEl.attr('id').split('-');
        commentId = commentId[1];
        var url = $.jlm.base + '/admin/comments/mark_spam';
        var data = { 'data[Comment][id]': commentId };
        $.post(url, data);

        // Animate
        commentEl.css({ backgroundColor: '#ff8181' });
        $('.comment-metadata', commentEl).css({ backgroundColor: '#ff8181' });
        commentEl.hide("drop", { direction: "right" }, 400, function() { $(this).remove() });
    },

    notSpam: function() {
        var commentEl = $(this).parent().parent().parent();

        var commentId = commentEl.attr('id').split('-');
        commentId = commentId[1];
        var url = $.jlm.base + '/admin/comments/not_spam';
        var data = { 'data[Comment][id]': commentId };
        $.post(url, data);

        // Animate
        commentEl.css({ backgroundColor: '#c7efca' });
        $('.comment-metadata', commentEl).css({ backgroundColor: '#c7efca' });
        commentEl.hide("drop", { direction: "left" }, 400, function() { $(this).remove() });
    }

});

$.jlm.component('ListItemActions', '*', function() {
    
    var actionHandleEls = $('.actions-handle');
    
    if (actionHandleEls.size() < 1) return;
    
    var itemActionsTimeout = null;
    
    var over = function() {
        if (itemActionsTimeout) {
            // Cancel all to be closed and hide them
            clearTimeout(itemActionsTimeout);
            $('.row-actions:visible').hide();
        }
        
        $(this).find('.row-actions').show();
    }
    
    var out = function() {
        if (itemActionsTimeout) {
            clearTimeout(itemActionsTimeout);
        }
		
		var el = this;
		
        itemActionsTimeout = setTimeout(function() {
            if ($.browser.msie) { // IE7 does not handle animations well, therefore use plain hide()
                $(el).find('.row-actions').hide();
            }
            else {
                $(el).find('.row-actions').fadeOut(500);
            }
        }, 1000);
    }
      
    actionHandleEls.hover(over, out);
    
});
$.jlm.component('RenameTitle', 'pages.admin_edit, posts.admin_edit', function() {
    
    $('.rename_title').click(function() {
        $('.title_as_heading').hide();
        $('.rename_title_section').show().find('input:first').focus();
        return false;
    });
    
    $('.rename_cancel .cancel').click(function() {
        $('.title_as_heading').show();
        $('.rename_title_section').hide();
        return false;
    });
    
    // Save...
    
});
/**
 * Select Actions Component
 *
 * Used on lists with checkboxes. On checking some, action menus pop up.
 */
$.jlm.component('SelectActions', '*', function() {
    
     var selectActionsEl = $('.select-actions');
     var handledFormEl = $('form:first');
     
     // Mark all selectedEls items
     var selectedEls = $('input:checked', handledFormEl);
     if (selectedEls.size() > 0) {
         selectedEls.parent().parent('li').addClass('selected');
         selectActionsEl.show();
     }

     function selectionChanged() {
         selectedEls = $('input:checked', handledFormEl);
         
         if (selectedEls.size() > 0) {
             selectActionsEl.slideDown(100);
         } else {
             selectActionsEl.slideUp(100);
         }
         
         // Add selectedEls class
         $(this).parent().parent('li').toggleClass('selected');
         
         return true;
     }

     $('input[type=checkbox]', handledFormEl).click(selectionChanged);
     
     function deleteChecked() {
         var checkboxEl = $('input:checked');
         $(checkboxEl).each(function() {
             var commentEl = null;
             var id = $(this).attr('name');
             id = end(explode('][', id));
             id = intval(str_replace(']', '', id));
             commentEl = $('#comment-' + id);
             commentEl.css('backgroundColor', 'red').fadeOut('slow');
         });
     }
     
     function spamChecked() {
         var checkboxEl = $('input:checked');
          $(checkboxEl).each(function() {
              var commentEl = null;
              var id = $(this).attr('name');
              id = end(explode('][', id));
              id = intval(str_replace(']', '', id));
              commentEl = $('#comment-' + id);
              commentEl
                .css('backgroundColor', '#f1d6d6')
                .hide("slide", { direction: "down" }, 1000);
          });
     }
     
     // Bind main actions
     $('.select-actions > a', handledFormEl).click(function() {
         var rel = $(this).attr('rel');
         var msg = 'Do you really want to ' + str_replace('!', '', rel) + ' selected items?';
         var doContinue = confirm(msg);
         if (doContinue) {
             var url = handledFormEl.attr('action');
             
             var formAppend = '<input type="hidden" name="data[__action]" value="' + rel + '" />';
             // @TODO add AJAX submit and UI refresh
             handledFormEl.append(formAppend).submit();

             if ('delete' == rel) {
                 deleteChecked();
             } else if ('spam!' == rel) {
                 spamChecked();
             }
         }
         return false;
     });
     
     // Bind select All/None
     $('a[href=#SelectAll]', handledFormEl).click(function() {
         $('input:checkbox', handledFormEl).attr('checked', 'true').parent().parent('li').addClass('selected');
         return false;
     });
     
     $('a[href=#SelectNone]', handledFormEl).click(function() {
         selectActionsEl.slideUp(100);
         $('input:checkbox', handledFormEl).removeAttr('checked').parent().parent('li').removeClass('selected');
         return false;
     });
     
});

$.jlm.addComponent('tinyMce', {
    
    focusOnReady: false,

    startup: function() {
        if (typeof(tinyMCE) == 'object') {
            $('textarea.tinymce').each(function() {
                var textareaEl = $(this);
                if (textareaEl.hasClass('fill_screen')) {
                    $.jlm.components.tinyMce.resizeToFillScreen(textareaEl);

                    $(window).bind('resize', function() {
                        var height = $.jlm.components.tinyMce.resizeToFillScreen(textareaEl);
                        $('.mceLayout').height(height);
                        $('.mceLayout iframe').height(height);
                    });
                }
                $.jlm.components.tinyMce.editorId = textareaEl.attr('id');
                tinyMCE.execCommand("mceAddControl", true, $.jlm.components.tinyMce.editorId);
            });
        }
	},
	
	getConfig: function() {
	    var stylesheetUrl = $.jlm.base + '/css/tiny_mce.css';
        var fullBaseUrl = window.location.protocol + "//" + window.location.host + '/';
	    return {
            mode: "none",
            theme: "advanced",
            // @TODO cleanup unneeded plugins
            plugins: "wfinsertimage,safari,style,paste,directionality,visualchars,nonbreaking,xhtmlxtras,inlinepopups,fullscreen",
            doctype: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',

            // Theme options
            theme_advanced_buttons1: "undo,redo,|,bold,italic,strikethrough,|,formatselect,styleselect,|,bullist,numlist,|,outdent,indent,blockquote,|,link,unlink,wfinsertimage,wfinsertwidget,|,charmap,code,fullscreen",
            theme_advanced_styles : "Align left=left;Align right=right",
    		theme_advanced_buttons2: "",
    		theme_advanced_buttons3: "",
            theme_advanced_toolbar_location: "top",
            theme_advanced_toolbar_align: "left",
            theme_advanced_statusbar_location: "none",
            theme_advanced_resizing: false,
            theme_advanced_resize_horizontal: false,
    		theme_advanced_path: false,
            width: '100%',

            // URLs
            relative_urls: false,
            remove_script_host: false,
            document_base_url: fullBaseUrl,
            convert_urls: false,
            
            content_css: stylesheetUrl,
            
            init_instance_callback: $.jlm.components.tinyMce.onReady
        };
	},
	
	focus: function() {
	    $.jlm.components.tinyMce.focusOnReady = true;
	},
	
	onReady: function(ed) {
	    $.jlm.components.tinyMce.editorInstance = ed;
	    if ($.jlm.components.tinyMce.focusOnReady) {
	        ed.focus();
	    }
	},
	
	loadInsertImageContent: function(url) {
	    $('.insert_image_sidebar').remove();
	    
	    $.get(url, function(html) {
	        var imageSidebarEl = $(html);
	        $('.main_sidebar').hide();
	        
	        $('#sidebar > ul').append(imageSidebarEl);
            
            // Bind selecting
            $('.file-list > li', imageSidebarEl).click(function() {
                $('#image-browser .selected').removeClass('selected');
                $(this).addClass('selected');
            });
            
            // Bind insert button
    		$('#insert_image', imageSidebarEl).click(function() {
    			var imgName = $('.selected img', imageSidebarEl).attr('alt');

    			if (typeof(imgName) == 'undefined' || trim(imgName) == '') {
    			    return false;
    			}

                // Original size
                imgNameEscaped = escape(imgName);
                var imgUrl = $.jlm.base + '/' + $.jlm.params.custom.wildflowerUploads + '/' + imgNameEscaped;

                // Thumbnail
                var resizeWidth = $('#resize_x', imageSidebarEl).val();
                var crop = 1;
                var resizeHeight = $('#resize_y', imageSidebarEl).val();
                if (intval(resizeHeight) < 1) {
                    resizeHeight = resizeWidth;
                }
                if (intval(resizeHeight) > 1) {
                    imgUrl = $.jlm.base + '/wildflower/thumbnail/' + imgNameEscaped + '/' + resizeWidth + '/' + resizeHeight + '/' + crop;
                }

    			// Image HTML
    			var imgHtml = '<img alt="' + imgName + '" src="' + imgUrl + '" />';

    			$.jlm.components.tinyMce.editor.execCommand('mceInsertContent', 0, imgHtml);

    			return false;
    		});

    		// Bind close
            $('.cancel', imageSidebarEl).click(function() {
                $('.insert_image_sidebar').remove();
                $('.main_sidebar').show();
                return false;
            });
            
            // Bind pagination
            $('.paginator a', imageSidebarEl).click(function() {
                var url = $(this).attr('href');
                $.jlm.components.tinyMce.loadInsertImageContent(url);
                return false;
            });
		});
	},
	
	insertImage: function(editor) {
	    $.jlm.components.tinyMce.editor = editor;
	    
	    // Close if open
	    if ($('.insert_image_sidebar').size() > 0) {
	        $('.insert_image_sidebar').remove();
	        $('.main_sidebar').show();
	        return false;
	    }
	    
	    var url = $.jlm.base + '/' + $.jlm.params.prefix + '/assets/insert_image';
	    $.jlm.components.tinyMce.loadInsertImageContent(url);	    
	    return false;
	},
	
	resizeToFillScreen: function(textareaEl) {
	    var otherContentHeight = $('body').height() - textareaEl.height();
	    var bumper = 20;
	    var result = $(window).height() - otherContentHeight - bumper; 
	    
		textareaEl.height(result);
		return result;
	},
	
	closeDialog: function() {
		$.jlm.components.tinyMce.dialogEl.remove();
	},
	
	insertWidget: function(editor) {
	    // Close if open
	    var alreadyOpenEl = $('.insert_widget_sidebar');
	    if (alreadyOpenEl.size() > 0) {
	        alreadyOpenEl.remove();
	        $('.main_sidebar').show();
	        return false;
	    }
	    
	    var url = $.jlm.base + '/' + $.jlm.params.prefix + '/widgets/list_widgets';
	    
	    $.get(url, function(html) {
	        var widgetSidebarEl = $(html);
	        $('.main_sidebar').hide();
	        $('#sidebar > ul').append(widgetSidebarEl);
	        
	        // Bind insert
	        $('.widget_list a').click(function() {
	            var url = $.jlm.base + '/' + $.jlm.params.prefix + '/widgets/insert_widget';
	            var widgetId = $(this).attr('rel');
	            $.getJSON(url, function(json) {
	                var instanceId = json.id;
	                var src = $.jlm.base + '/wildflower/widgets/' + widgetId + '.png';
    	            var widgetHtml = '<img id="' + widgetId + '" class="admin_widget admin_widget_id_' + instanceId + '" src="' + src + '" />';
    	            editor.execCommand('mceInsertContent', 0, widgetHtml);
	            });
	            return false;
	        });
		});
	    
	    return false;
	},
    
    insertLink: function() {
        log('INSERT LINK');
    }
});

/**
 * Type Search
 *
 * Powers the sidebar search boxes. Searches as you type.
 */
$.jlm.component('TypeSearch', '*', function() {
    
    var searchFormEl = $('#sidebar .search');
    if (searchFormEl.size() < 1) {
        return;
    }
    
    searchFormEl.submit(function(){
        // @TODO perform search
        return false;
    }); 
    
    var queryInputEl = $('#SearchQuery');
    queryInputEl.val('');
    var timedAction = null;
    var searchRequest = null;
    var url = searchFormEl.attr('action') + '/';
    
    var doSearch = function() {
        $('#sidebar-search-results').remove();
        
        // Abort previous search
        if (searchRequest) {
            searchRequest.abort();
        }
        
        var query = queryInputEl.val();
        
        // Don't search for no query or too small query
        if (!query || query.length < 3) {
            return;
        }   

        searchRequest = $.get(url + encodeURI(query), function(html) {
            $('#sidebar-search-results').remove();
            searchFormEl.append(html);
        });
    }
    
    queryInputEl.keyup(function() {
        if (timedAction) {
            clearTimeout(timedAction);
        }
        
        timedAction = setTimeout(doSearch, 1000);
    });

});

$.jlm.addComponent('widgets', {
    
    edit: function(e) {
        var t = this;
        
        // First make sure this is a widget el
        var jEl = $(e);
        if (!jEl.hasClass('admin_widget')) {
            return false;
        }
        
        // Hide sidebar contet
        t.sidebarContent = $('#sidebar ul');
        t.sidebarContent.hide();
        
        // Hide main content
        t.contentPadEl = $('#content_pad');
        t.mainContent = t.contentPadEl.children();
        t.mainContent.hide();
        
        // Load the widget config action
        var widgetName = jEl.attr('id');
        var widgetId = jEl.attr('class').replace('admin_widget admin_widget_id_', '');
        var url = $.jlm.base + '/' + $.jlm.params.prefix + '/widgets/config/' + widgetName + '/' + widgetId;
        
        $.post(url, function(html) {
            var configEl = $(html);
            t.contentPadEl.append(configEl);
            
            // Bind AJAX save
            function successCallback() {
                t.closeEdit();
                return false;
            }
            $('#edit_widget_form').ajaxForm({ success: successCallback });
            
            // Bind cancel button
            $('#CancelWidgetEdit').click(successCallback);
            
            // Add new
            //$('a[href=#AddNewCell]').click(t.addNewCell);
        });
	},
	
	addNewCell: function() {
	    var newBlockEl = $('.slider_block:first').clone();
	    var index = $('.slider_block').size();
	    $('input:first', newBlockEl).val('').attr('name', 'data[Widget][items][' + index + '][label]');
	    $('input:last', newBlockEl).val('').attr('name', 'data[Widget][items][' + index + '][url]');
        // newBlockEl = '<div class="slider_block">' + newBlockEl.html() + '</div>';
        
        // newBlockEl = newBlockEl.replace('0', index.toString());
	    $('.slider_block:last').after(newBlockEl);
	},
	
	closeEdit: function() {
        this.contentPadEl.children(':visible').remove();
        this.sidebarContent.show();
        this.mainContent.show();
        $.jlm.components.tinyMce.resizeToFillScreen($('.tinymce'));
	}
	
});

$.jlm.component('WriteNew', 'posts.admin_index, posts.admin_edit, pages.admin_index, pages.admin_edit', function() {
    
    $('#sidebar .add').click(function() {
        // if ($('.new-dialog').size() > 0) {
        //     return false;
        // }
        // Hide sidebar contet
        var sidebarContent = $('#sidebar ul');
        sidebarContent.hide();
        
        var buttonEl = $(this);
        var formAction = buttonEl.attr('href');
        
        var templatePath = 'posts/new_post';
        var parentPageOptions = null;
        if ($.jlm.params.controller == 'pages') {
            templatePath = 'pages/new_page';
            parentPageOptions = $('.all-page-parents').html();
            parentPageOptions = parentPageOptions.replace('[Page]', '[Page]');
            parentPageOptions = parentPageOptions.replace('[parent_id_options]', '[parent_id]');
        }
        
        var dialogEl = $($.jlm.template(templatePath, { action: formAction, parentPageOptions: parentPageOptions }));
        
        var contentEl = $('#content_pad');
        
        contentEl.append(dialogEl);
        
        var toHeight = 230;
        
        var hiddenContentEls = contentEl.animate({
            height: toHeight
        }, 600, function() {
            // After the animation, focus the title input box
            $('.input:first input', dialogEl).focus();
        }).children().not(dialogEl).hide();
        
        // Bind cancel link
        $('.cancel-edit a', dialogEl).click(function() {
            dialogEl.remove();
            hiddenContentEls.show();
            contentEl.height('auto');
            sidebarContent.show();
            return false;
        });
        
        // Create link
        // TODO - first submit data by AJAX, on success redirect
        $('.submit input', dialogEl).click(function() {
            //$(this).attr('disabled', 'disabled').attr('value', 'Saving...');
            return true;
        });
        
        return false;
    });
    
});
// Scripts executed globaly or with more controllers

$.jlm.bind('app_controller.beforeFilter', function () {
    
    $.jlm.components.tinyMce.startup();
    
});



$.jlm.bind('comments.admin_index, comments.admin_spam', function () {
    
    $.jlm.components.inplaceEdit.startup();
    
});
$.jlm.bind('menus.admin_add, menus.admin_edit', function() {
    
    function bindRemove() {
        $('.menu_items .delete').click(function() {
            $(this).parent('li').fadeOut(600, function() {
                $(this).remove();
            });
            
            // If on edit delete the real item
            if ($.jlm.params.action == 'admin_edit') {
                $.post($(this).attr('href'));
            }
            
            return false;
        });
    }
    
    function renameNames() {
        var index = 0;
        $('.menu_items li').each(function() {
            var html = $(this).html();
            var labelName = $('.menu_item_label input', this).attr('name');
            var urlName = $('.menu_item_url input', this).attr('name');
            var idName = $('input[type=hidden]', this).attr('name');
            //debug(labelName);debug(urlName);
            var replace = [labelName, urlName, idName];
            var replaceWith = ['data[MenuItem][' + index + '][label]', 'data[MenuItem][' + index + '][url]', 'data[MenuItem][' + index + '][id]'];
            //debug(replace);debug(replaceWith)
            html = str_replace(replace, replaceWith, html);
            $(this).html(html);
            index++;
        });
    }
    
    function bindMove() {
        $('.menu_items').sortable({
            axis: 'y',
            handle: '.move',
            placeholder: 'drop_here',
            update: renameNames
        });
    }
    
    bindRemove();
    bindMove();
    
    $('#add_menu_item').click(function() {
        var template = $('.menu_items li:last').html();
        $('.menu_items').append('<li>' + template + '</li>');
        renameNames();
        // Reset values
        $('.menu_items li:last input').val('');
        // Remove ID
        $('.menu_items li:last input[type=hidden]').remove();
        bindRemove();
        bindMove();
        return false;
    });
    

    
});
$.jlm.bind('pages.admin_edit', function() {
   
   $('textarea:first').focus();
   
   var origText = $('a[href=#ShowSidebarEditor]').text();
   $('a[href=#ShowSidebarEditor]').toggle(function() {
       $('.sidebar_editor').slideDown(500, function() {
           $('.sidebar_editor textarea').focus();
       });
       $(this).text('Hide sidebar editor');
       return false;
   }, function() {
       $('.sidebar_editor').hide();
       $(this).text(origText);
       return false;
   });
    
});
$.jlm.bind('pages.admin_reorder', function() {
    
    var movedPage = null;
    var dropZoneHtml = '<div class="drop_zone">drop here</div>';
    
    function appendDropZones() {
        // Remove any old first
        $('.drop_zone').remove();
        $('.page_reorder_list li').prepend(dropZoneHtml);
        // Append to last
        $('.page_reorder_list > li:last-child, .page_reorder_list ul > li:last-child').append(dropZoneHtml);
        $('.drop_zone').click(movePage);
    }
    
    function startMove() {
        var parentEl = $(this).parent('li');
        movedPage = parentEl.clone();
        parentEl.remove();
        appendDropZones();
        // Click on a page title creates a child
        $('.page_reorder_list a').unbind('click').click(createChildren);
        return false;
    }
    
    function movePage() {
        var parentEl = $(this).parent('li');
        parentEl.before(movedPage.hide());
        movedPage.fadeIn('slow');
        movedPage = null;
        $('.drop_zone').remove();
        $('.page_reorder_list a').unbind('click').click(startMove);
        return false;
    }
    
    function createChildren() {
        var append = $('<ul>' + movedPage.html() + '</ul>');
        $(this).parent('li').append(append);
        movedPage = null;
        append.fadeIn('slow');
        $('.page_reorder_list a').unbind('click').click(startMove);
        $('.drop_zone').remove();
        return false;
    }
   
    $('.page_reorder_list a').click(startMove);
    
});

$.jlm.bind('posts.admin_categorize', function() {
    
    // Add new category box AJAX form
    var buttonEl = $('#add-category-box .submit input');
    var formEl = $('#add-category-box form');
    var originalLabel;
    
    var successCallback = function(json) {
        buttonEl.attr('value', originalLabel).removeAttr('disabled');
        
        // Replace the list with updated one
        $('.category-list').before(json.list).remove();
        // Rebind delete links
        bindDeleteLinks();
        
        // Hight the added category

        //parentLiEl.after(json['category-list-item']).effect('highlight', {}, 4000);
    };
    
    var errorCallback = function(data) {
        alert('Error while saving. Check FireBug console for debug data.');
        if (typeof(console) == 'object') {
            console.debug(data);
        }
        buttonEl.attr('value', originalLabel).removeAttr('disabled');
    }
    
    formEl.submit(function() {
        originalLabel = buttonEl.attr('value');
        buttonEl.attr('value', 'Adding...').attr('disabled', 'disabled');

        formEl.ajaxSubmit({ dataType: 'json', success: successCallback, error: errorCallback });
        
        return false;
    });
    
    
    // Delete category
    function bindDeleteLinks() {
        $('.category-list .trash').click(function() {
            // Really?
            // @TODO add L18n
            if (!confirm('No posts will be deleted if you remove this category. Do you want to proceed?')) {
                return false;
            }
            
            var linkEl = $(this);
            var url = linkEl.attr('href');
            $.post(url, { _method: 'POST' });
            linkEl.parent('label').parent('li')
                .css({ backgroundColor: '#cf2a2a', color: '#fff' })
                .fadeOut(1000, function() {
                    $(this).remove();
                });
                
            // Update the parent category select box in the sidebar    
                
            return false;
        });
    }
    
    bindDeleteLinks();
    
});

$.jlm.bind('posts.admin_edit', function() {
    // Update post form on category select
    $('#CategoryCategory').val($('#category_id').val());
    $('#category_id').change(function() {
        var id = $(this).val();
        $('#CategoryCategory').val(id);
    });
    
});

$.jlm.bind('settings.admin_index', function() {
    
    function showHideSmtpOptions() {
		var method = $('#setting-email_delivery select').val();
        var smtpEls = $('#setting-smtp_server, #setting-smtp_username, #setting-smtp_password');
        if (method != 'smtp') {
            smtpEls.hide();
        } else {
            smtpEls.show();
        }
	}
    
    showHideSmtpOptions();
	$('#setting-email_delivery select').change(showHideSmtpOptions);
	
});

$.jlm.bind('users.admin_change_password', function() {

    $('form').clearForm();
	
});
