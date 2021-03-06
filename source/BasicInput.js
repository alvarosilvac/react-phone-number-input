import React, { PureComponent } from 'react'
import { polyfill as reactLifecyclesCompat } from 'react-lifecycles-compat'

import { parsePhoneNumberCharacters, formatPhoneNumber } from './input-control'

/**
 * `BasicInput`'s caret is not as "smart" as the default `inputComponent`'s
 * but still works good enough. When erasing or inserting digits in the middle
 * of a phone number the caret usually jumps to the end: this is the expected
 * behaviour and it's the workaround for the [Samsung Galaxy smart caret positioning bug](https://github.com/catamphetamine/react-phone-number-input/issues/75).
 */
@reactLifecyclesCompat
export default class BasicInput extends PureComponent
{
	// Prevents React from resetting the `<input/>` caret position.
	// https://github.com/reactjs/react-redux/issues/525#issuecomment-254852039
	// https://github.com/facebook/react/issues/955
	static getDerivedStateFromProps({ value })
	{
		$('#childPhoneInput').trigger('onChange');
		return { value }
	}

	state = {}

	onChange = (event) =>
	{
		console.log('inside this',event.target.value)
		const { onChange, onInput } = this.props //this props will send to parents
		const { value } = this.state

		let newValue = parsePhoneNumberCharacters(event.target.value)

		// By default, if a value is something like `"(123)"`
		// then Backspace would only erase the rightmost brace
		// becoming something like `"(123"`
		// which would give the same `"123"` value
		// which would then be formatted back to `"(123)"`
		// and so a user wouldn't be able to erase the phone number.
		// Working around this issue with this simple hack.
		if (newValue === value)
		{
			if (this.format(newValue).indexOf(event.target.value) === 0)
			{
				// Trim the last digit (or plus sign).
				newValue = newValue.slice(0, -1)
			}
		}

		// Prevents React from resetting the `<input/>` caret position.
		// https://github.com/reactjs/react-redux/issues/525#issuecomment-254852039
		// https://github.com/facebook/react/issues/955
		this.setState({ value: newValue }, () => {console.log('1 i am setting the state in onchange BasicInput'); onChange(newValue); console.log('2 I continue to input'); onInput(newValue); console.log('3 done in basic onchange')}) //we are sending then the newValues to the props
	}

	format(value)
	{
		const { country, metadata } = this.props

		return formatPhoneNumber(value, country, metadata).text
	}

	focus()
	{
		this.input.focus()
	}

	storeInput = (ref) => this.input = ref

	render()
	{
		const
		{
			// value,
			onChange,
			country,
			metadata,
			onInput,
			...rest
		}
		= this.props

		// Prevents React from resetting the `<input/>` caret position.
		// https://github.com/reactjs/react-redux/issues/525#issuecomment-254852039
		// https://github.com/facebook/react/issues/955
		const { value } = this.state

		return (
			<input
				{...rest}
				id="childPhoneInput"
				ref={this.storeInput}
				value={this.format(value)}
				onChange={this.onChange}
				onInput={this.onChange}
			/>
		)
	}
}