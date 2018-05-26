import React from 'react';
import PropTypes from 'prop-types';

const CheckboxGroup = (props) => (
	<div>
		<div className="checkbox-group form-group">
			{props.options.map(option => {
				return (
					<label key={option} className="form-checkbox form-label capitalize">
						<input
							className="form-checkbox"
							name={props.setName}
							onChange={props.controlFunc}
							value={option}
							checked={props.selectedOptions.indexOf(option) > -1}
							type={props.type}/>
							<i className="form-icon"></i>
							{option}		
					</label>
				);
			})}
		</div>
	</div>
);

CheckboxGroup.propTypes = {
	title: PropTypes.string,
	type: PropTypes.oneOf(['checkbox', 'radio']).isRequired,
	setName: PropTypes.string,
	options: PropTypes.array,
	selectedOptions: PropTypes.array,
	controlFunc: PropTypes.func.isRequired
};

export default CheckboxGroup;
