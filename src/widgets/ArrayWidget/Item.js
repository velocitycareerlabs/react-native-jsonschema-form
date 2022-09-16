import React from 'react';
import PropTypes from 'prop-types';
import RemoveHandle from './RemoveHandle';

const useOnRemovePress = ({ index, onRemove }) => () => onRemove(index);

const Item = ({
  propertyName,
  propertyValue,
  propertySchema,
  propertyMeta,
  propertyErrors,
  PropertyField,
  RemoveComponent,
  itemTitle,
  ...props
}) => {
  const {
    removable,
    propertyUiSchema,
  } = props;
  const onRemovePress = useOnRemovePress(props);

  return (
    <React.Fragment>
      <PropertyField
        {...props}
        name={propertyName}
        schema={propertySchema}
        uiSchema={{ ...propertyUiSchema, 'ui:title': `${itemTitle} ${props.index + 1}` }}
        errors={propertyErrors}
        value={propertyValue}
        meta={propertyMeta}
      />
      {removable && (RemoveComponent !== RemoveHandle) ? (
        <RemoveComponent onRemovePress={onRemovePress} {...props} />
      ) : null}
      {removable && RemoveComponent === RemoveHandle ? (
        <RemoveComponent onRemovePress={onRemovePress} {...props} />
      ) : null}
    </React.Fragment>
  );
};

Item.propTypes = {
  value: PropTypes.arrayOf(PropTypes.any).isRequired,
  index: PropTypes.number.isRequired,
  propertyName: PropTypes.string.isRequired,
  propertySchema: PropTypes.shape().isRequired,
  propertyUiSchema: PropTypes.shape().isRequired,
  propertyMeta: PropTypes.any.isRequired, // eslint-disable-line
  orderable: PropTypes.bool.isRequired,
  removable: PropTypes.bool.isRequired,
  RemoveComponent: PropTypes.elementType.isRequired,
  PropertyField: PropTypes.elementType.isRequired,
  auto: PropTypes.bool,
  itemTitle: PropTypes.string,
  propertyValue: PropTypes.any, // eslint-disable-line
  propertyErrors: PropTypes.any, // eslint-disable-line
};

Item.defaultProps = {
  auto: false,
  propertyErrors: undefined,
  itemTitle: '',
};

export default Item;
