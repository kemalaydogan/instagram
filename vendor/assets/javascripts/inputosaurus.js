/**
 * Inputosaurus Text 
 *
 * Must be instantiated on an <input> element
 * Allows multiple input items. Each item is represented with a removable tag that appears to be inside the input area.
 *
 * @requires:
 *
 * 	jQuery 1.7+
 * 	jQueryUI 1.8+ Core
 *
 * @version 0.1.6
 * @author Dan Kielp <dan@sproutsocial.com>
 * @created October 3,2012
 *
 */


(function($) {

	var inputosaurustext = {

		version: "0.1.6",

		eventprefix: "inputosaurus",

		options: {

			// bindable events
			//
			// 'change' - triggered whenever a tag is added or removed (should be similar to binding the the change event of the instantiated input
			// 'keyup' - keyup event on the newly created input

			// while typing, the user can separate values using these delimiters
			// the value tags are created on the fly when an inputDelimiter is detected
			inputDelimiters : [',', ';'],

			// this separator is used to rejoin all input items back to the value of the original <input>
			outputDelimiter : ',',

			allowDuplicates : false,

			parseOnBlur : false,

			// optional wrapper for widget
			wrapperElement : null,

			width : null,

			// simply passing an autoComplete source (array, string or function) will instantiate autocomplete functionality
			autoCompleteSource : '',

			// When forcing users to select from the autocomplete list, allow them to press 'Enter' to select an item if it's the only option left.
			activateFinalResult : false,

			// manipulate and return the input value after parseInput() parsing
			// the array of tag names is passed and expected to be returned as an array after manipulation
			parseHook : null,

			// define a placeholder to display when the input is empty
			placeholder: null,

			// when you check for duplicates it check for the case
			caseSensitiveDuplicates: false
		},

		_create: function() {
			var widget = this,
				els = {},
				o = widget.options,
				placeholder =  o.placeholder || this.element.attr('placeholder') || null;

			this._chosenValues = [];

			// Create the elements
			els.ul = $('<ul class="inputosaurus-container">');
			els.input = $('<input type="text" />');
			els.inputCont = $('<li class="inputosaurus-input inputosaurus-required"></li>');
			els.origInputCont = $('<li class="inputosaurus-input-hidden inputosaurus-required">');

			// define starting placeholder
			if (placeholder) { 
				o.placeholder = placeholder;
				els.input.attr('placeholder', o.placeholder); 
				if (o.width) {
					els.input.css('min-width', o.width - 50);
				}
			}

			o.wrapperElement && o.wrapperElement.append(els.ul);
			this.element.replaceWith(o.wrapperElement || els.ul);
			els.origInputCont.append(this.element).hide();

			els.inputCont.append(els.input);
			els.ul.append(els.inputCont);
			els.ul.append(els.origInputCont);

			o.width && els.ul.css('width', o.width);

			this.elements = els;

			widget._attachEvents();

			// if instantiated input already contains a value, parse that junk
			if($.trim(this.element.val())){
				els.input.val( this.element.val() );
				this.parseInput();
			}

			this._instAutocomplete();
		},

		_instAutocomplete : function() {
			if(this.options.autoCompleteSource){
				var widget = this;

				this.elements.input.autocomplete({
					position : {
						of : this.elements.ul
					},
					source : this.options.autoCompleteSource,
					minLength : 1,
					select : function(ev, ui){
						ev.preventDefault();
						widget.elements.input.val(ui.item.value);
						widget.parseInput();
					},
					open : function() {
						// Older versions of jQueryUI have a different namespace
						var auto =  $(this).data('ui-autocomplete') || $(this).data('autocomplete');
						var menu = auto.menu,
							$menuItems;


						// zIndex will force the element on top of anything (like a dialog it's in)
						menu.element.zIndex && menu.element.zIndex($(this).zIndex() + 1);
						menu.element.width(widget.elements.ul.outerWidth());

						// auto-activate the result if it's the only one
						if(widget.options.activateFinalResult){
							$menuItems = menu.element.find('li');

							// activate single item to allow selection upon pressing 'Enter'
							if($menuItems.size() === 1){
								menu[menu.activate ? 'activate' : 'focus']($.Event('click'), $menuItems);
							}
						}
					}
				});
			}
		},

		_autoCompleteMenuPosition : function() {
			var widget;
			if(this.options.autoCompleteSource){
				widget = this.elements.input.data('ui-autocomplete') || this.elements.input.data('autocomplete');
				widget && widget.menu.element.position({
					of: this.elements.ul,
					my: 'left top',
					at: 'left bottom',
					collision: 'none'
				});
			}
		},

		/*_closeAutoCompleteMenu : function() {
			if(this.options.autoCompleteSource){
				this.elements.input.autocomplete('close');
			}
		},*/

		parseInput : function(ev) {
			var widget = (ev && ev.data.widget) || this,
				val,
				delimiterFound = false,
				values = [];

			val = widget.elements.input.val();

			val && (delimiterFound = widget._containsDelimiter(val));

			if(delimiterFound !== false){
				values = val.split(delimiterFound);
			} else if(!ev || ev.which === $.ui.keyCode.ENTER && !$('.ui-menu-item .ui-state-focus').size() && !$('#ui-active-menuitem').size()){
				values.push(val);
				ev && ev.preventDefault();

			// prevent autoComplete menu click from causing a false 'blur'
			} else if(ev.type === 'blur' && !$('#ui-active-menuitem').size()){
				values.push(val);
			}

			$.isFunction(widget.options.parseHook) && (values = widget.options.parseHook(values));

			if(values.length){
				widget._setChosen(values);
				widget.elements.input.val('');
				widget._resizeInput();
			}

			widget._resetPlaceholder();
		},

		_inputFocus : function(ev) {
			var widget = ev.data.widget || this;

			widget.elements.input.value || (widget.options.autoCompleteSource.length && widget.elements.input.autocomplete('search', ''));
		},

		_inputKeypress : function(ev) {
			var widget = ev.data.widget || this;

			ev.type === 'keyup' && widget._trigger('keyup', ev, widget);

			switch(ev.which){
				case $.ui.keyCode.BACKSPACE:
					ev.type === 'keydown' && widget._inputBackspace(ev);
					break;

				case $.ui.keyCode.LEFT:
					ev.type === 'keydown' && widget._inputBackspace(ev);
					break;

				default :
					widget.parseInput(ev);
					widget._resizeInput(ev);
			}

			// reposition autoComplete menu as <ul> grows and shrinks vertically
			if(widget.options.autoCompleteSource){
				setTimeout(function(){widget._autoCompleteMenuPosition.call(widget);}, 200);
			}
		},

		// the input dynamically resizes based on the length of its value
		_resizeInput : function(ev) {
			var widget = (ev && ev.data.widget) || this,
				maxWidth = widget.elements.ul.width(),
				val = widget.elements.input.val(),
				txtWidth = 25 + val.length * 8;

			widget.elements.input.width(txtWidth < maxWidth ? txtWidth : maxWidth);
		},

		// resets placeholder on representative input
		_resetPlaceholder: function () {
			var placeholder = this.options.placeholder,
				input = this.elements.input,
				width = this.options.width || 'inherit';
			if (placeholder && this.element.val().length === 0) {
				input.attr('placeholder', placeholder).css('min-width', width - 50)
			}else {
				input.attr('placeholder', '').css('min-width', 'inherit')
			}
		},

		// if our input contains no value and backspace has been pressed, select the last tag
		_inputBackspace : function(ev) {
			var widget = (ev && ev.data.widget) || this;
				lastTag = widget.elements.ul.find('li:not(.inputosaurus-required):last');

			// IE goes back in history if the event isn't stopped
			ev.stopPropagation();

			if((!$(ev.currentTarget).val() || (('selectionStart' in ev.currentTarget) && ev.currentTarget.selectionStart === 0 && ev.currentTarget.selectionEnd === 0)) && lastTag.size()){
				ev.preventDefault();
				lastTag.find('a').focus();
			}

		},

		_editTag : function(ev) {
			var widget = (ev && ev.data.widget) || this,
				tagName = '',
				tagKey = $(ev.currentTarget).closest('li').data('inputosaurus');

			if(!tagKey){
				return true;
			}

			ev.preventDefault();

			$.each(widget._chosenValues, function(i,v) {
				v.key === tagKey && (tagName = v.value);
			});

			widget.elements.input.val(tagName);

			widget._removeTag(ev);
			widget._resizeInput(ev);
		},

		_tagKeypress : function(ev) {
			var widget = ev.data.widget;
			switch(ev.which){

				case $.ui.keyCode.BACKSPACE: 
					ev && ev.preventDefault();
					ev && ev.stopPropagation();
					$(ev.currentTarget).trigger('click');
					break;

				// 'e' - edit tag (removes tag and places value into visible input
				case 69:
					widget._editTag(ev);
					break;

				case $.ui.keyCode.LEFT:
					ev.type === 'keydown' && widget._prevTag(ev);
					break;

				case $.ui.keyCode.RIGHT:
					ev.type === 'keydown' && widget._nextTag(ev);
					break;

				case $.ui.keyCode.DOWN:
					ev.type === 'keydown' && widget._focus(ev);
					break;
			}
		},

		// select the previous tag or input if no more tags exist
		_prevTag : function(ev) {
			var widget = (ev && ev.data.widget) || this,
				tag = $(ev.currentTarget).closest('li'),
				previous = tag.prev();

			if(previous.is('li')){
				previous.find('a').focus();
			} else {
				widget._focus();
			}
		},

		// select the next tag or input if no more tags exist
		_nextTag : function(ev) {
			var widget = (ev && ev.data.widget) || this,
				tag = $(ev.currentTarget).closest('li'),
				next = tag.next();

			if(next.is('li:not(.inputosaurus-input)')){
				next.find('a').focus();
			} else {
				widget._focus();
			}
		},

		// return the inputDelimiter that was detected or false if none were found
		_containsDelimiter : function(tagStr) {

			var found = false;

			$.each(this.options.inputDelimiters, function(k,v) {
				if(tagStr.indexOf(v) !== -1){
					found = v;
				}
			});

			return found;
		},

		_setChosen : function(valArr) {
			var self = this;

			if(!$.isArray(valArr)){
				return false;
			}

			$.each(valArr, function(k,v) {
				var exists = false,
					obj = {
						key : '',
						value : ''
					};

				v = $.trim(v);

				$.each(self._chosenValues, function(kk,vv) {
					if(!self.options.caseSensitiveDuplicates){
						vv.value.toLowerCase() === v.toLowerCase() && (exists = true);
					}
					else{
						vv.value === v && (exists = true);
					}
				});

				if(v !== '' && (!exists || self.options.allowDuplicates)){

					obj.key = 'mi_' + Math.random().toString( 16 ).slice( 2, 10 );
					obj.value = v;
					self._chosenValues.push(obj);

					self._renderTags();
				}
			});
			self._setValue(self._buildValue());
		},

		_buildValue : function() {
			var widget = this,
				value = '';

			$.each(this._chosenValues, function(k,v) {
				value +=  value.length ? widget.options.outputDelimiter + v.value : v.value;
			});

			return value;
		},

		_setValue : function(value) {
			var val = this.element.val();

			if(val !== value){
				this.element.val(value);
				this._trigger('change');
			}
		},

		// @name text for tag
		// @className optional className for <li>
		_createTag : function(name, key, className) {
			className = className ? ' class="' + className + '"' : '';

			if(name !== undefined){
				return $('<li' + className + ' data-inputosaurus="' + key + '"><span>' + name + '</span> <a href="javascript:void(0);" class="ficon">&#x2716;</a></li>');
			}
		},

		_renderTags : function() {
			var self = this;

			this.elements.ul.find('li:not(.inputosaurus-required)').remove();

			$.each(this._chosenValues, function(k,v) {
				var el = self._createTag(v.value, v.key);
				self.elements.ul.find('li.inputosaurus-input').before(el);
			});
		},

		_removeTag : function(ev) {
			var key = $(ev.currentTarget).closest('li').data('inputosaurus'),
				indexFound = false,
				widget = (ev && ev.data.widget) || this;


			$.each(widget._chosenValues, function(k,v) {
				if(key === v.key){
					indexFound = k;
				}
			});

			indexFound !== false && widget._chosenValues.splice(indexFound, 1);

			widget._setValue(widget._buildValue());

			$(ev.currentTarget).closest('li').remove();
			widget.elements.input.focus();
		},

		_focus : function(ev) {
			var widget = (ev && ev.data.widget) || this;

			if(!ev || !$(ev.target).closest('li').data('inputosaurus')){
				widget.elements.input.focus();
			}
		},

		_tagFocus : function(ev) {
			$(ev.currentTarget).parent()[ev.type === 'focusout' ? 'removeClass' : 'addClass']('inputosaurus-selected');
		},

		refresh : function() {
			var delim = this.options.outputDelimiter,
				val = this.element.val(),
				values = [];

			values.push(val);
			delim && (values = val.split(delim));

			if(values.length){
				this._chosenValues = [];

				$.isFunction(this.options.parseHook) && (values = this.options.parseHook(values));

				this._setChosen(values);
				this._renderTags();
				this.elements.input.val('');
				this._resizeInput();
			}
		},

		_attachEvents : function() {
			var widget = this;

			this.elements.input.on('keyup.inputosaurus', {widget : widget}, this._inputKeypress);
			this.elements.input.on('keydown.inputosaurus', {widget : widget}, this._inputKeypress);
			this.elements.input.on('change.inputosaurus', {widget : widget}, this._inputKeypress);
			this.elements.input.on('focus.inputosaurus', {widget : widget}, this._inputFocus);
			this.options.parseOnBlur && this.elements.input.on('blur.inputosaurus', {widget : widget}, this.parseInput);

			this.elements.ul.on('click.inputosaurus', {widget : widget}, this._focus);
			this.elements.ul.on('click.inputosaurus', 'a', {widget : widget}, this._removeTag);
			this.elements.ul.on('dblclick.inputosaurus', 'li', {widget : widget}, this._editTag);
			this.elements.ul.on('focus.inputosaurus', 'a', {widget : widget}, this._tagFocus);
			this.elements.ul.on('blur.inputosaurus', 'a', {widget : widget}, this._tagFocus);
			this.elements.ul.on('keydown.inputosaurus', 'a', {widget : widget}, this._tagKeypress);
		},

		_destroy: function() {
			this.elements.input.unbind('.inputosaurus');

			this.elements.ul.replaceWith(this.element);

		}
	};

	$.widget("ui.inputosaurus", inputosaurustext);
})(jQuery);
