import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  omit, isString, isArray, keys,
} from 'lodash';
import Row from '../common/Row';
import Column from '../common/Column';
import { getComponent, withPrefix } from '../../utils';

/* eslint react/prop-types: 0 */
/* eslint no-use-before-define: 0 */

const styles = StyleSheet.create({
  labelTop: {
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 5,
  },
  grid: {
    marginLeft: -10,
    alignItems: 'flex-start',
  },
  item: {
    paddingLeft: 10,
  },
  containerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  row: {
    flexBasis: '100%',
    paddingHorizontal: 22,
  },
  withoutPadding: {
    paddingHorizontal: 0,
  },
  halfRow: {
    flexBasis: '50%',
    paddingHorizontal: 0,
  },
});

const attributes = ['type', 'children', 'style', 'columns'];

const getMeta = (schema) => {
  if (schema.type === 'array') {
    return [];
  }
  return {};
};

const createProperty = (property, gridItem, index, params) => {
  const {
    name,
    schema,
    fields,
    uiSchema,
    withoutHorizontalPadding,
  } = params;
  const uiProperty = uiSchema[property];
  const propertySchema = schema.properties[property];
  const propertyName = withPrefix(property, name);

  if (!propertySchema) {
    const UnexistentProperty = () => null;
    UnexistentProperty.key = propertyName;
    return UnexistentProperty;
  }

  const PropertyComponent = getComponent(propertySchema.type || 'string', 'Field', fields);

  if (!PropertyComponent) {
    const UnexistentPropertyComponent = () => null;
    UnexistentPropertyComponent.key = propertyName;
    return UnexistentPropertyComponent;
  }

  let PropertyContainer;
  let propertyContainerProps;
  if (gridItem.type === 'grid') {
    const columns = gridItem.columns || [];
    const column = (isArray(columns) ? columns[index] : columns) || {};
    PropertyContainer = Row;
    propertyContainerProps = {
      ...column,
      style: [
        styles.item,
        { zIndex: gridItem.children.length - index },
        column.style || null,
      ],
    };
  } else {
    PropertyContainer = React.Fragment;
    propertyContainerProps = {};
  }
  const onFocus = () => {
    const { onFocus } = params;
    if (onFocus) {
      onFocus(propertyName);
    }
  };

  const withoutPadding = withoutHorizontalPadding || propertySchema.format === 'date-time'
      || (propertySchema.type === 'object' && keys(propertySchema.properties).length);

  const Property = ({
    value,
    meta,
    errors,
    uiSchema,
    ...props
  }) => (
    <View style={[
      styles.row,
      uiProperty['ui:halfRow'] ? styles.halfRow : {},
      withoutPadding ? styles.withoutPadding : {},
    ]}
    >
      <PropertyContainer key={propertyName} {...propertyContainerProps}>
        <PropertyComponent
          {...props}
          value={value && value[property]}
          meta={(meta && meta[property]) || getMeta(propertySchema)}
          errors={errors && errors[property]}
          name={propertyName}
          onFocus={onFocus}
          schema={propertySchema}
          uiSchema={uiSchema[property]}
          gridItemType={gridItem.type}
          gridItemIndex={index}
          gridItemLength={gridItem.children.length}
          zIndex={gridItem.children.length - index}
        />
      </PropertyContainer>
    </View>
  );
  Property.key = propertyName;

  console.log('');

  return Property;
};

const getLabelComponent = ({
  key,
  first,
  params,
  gridItem,
}) => {
  const { widgets } = params;
  const Widget = widgets.LabelWidget;
  const Label = props => (
    <Widget
      {...props}
      {...omit(gridItem, attributes)}
      key={key}
      hasError={false}
      hasTitle
      toggleable={false}
      onPress={gridItem.onPress || undefined}
      style={[first ? styles.labelTop : styles.label, gridItem.style]}
    >
      {gridItem.children}
    </Widget>
  );
  Label.key = key;
  return Label;
};

const getGeneralComponent = ({
  gridItem,
  key,
  zIndex,
  params,
}) => {
  let Wrapper;
  if (gridItem.type === 'column') {
    Wrapper = Column;
  } else if (gridItem.type === 'view') {
    Wrapper = View;
  } else {
    Wrapper = Row;
  }

  const gridStyle = gridItem.type === 'grid' ? styles.grid : null;
  const items = gridItem.children.map((child, i) => {
    if (isString(child)) {
      return createProperty(child, gridItem, i, params);
    }
    return createGridItem({
      params,
      gridItem: child,
      key: `${key}-${i}`,
      zIndex: gridItem.children.length - i,
      first: i === 0,
      last: i === gridItem.children.length - 1,
    });
  });
  const GridItem = props => (
    <Wrapper
      className={`FormGridItem__${gridItem.type}`}
      {...omit(gridItem, attributes)}
      style={[gridItem.style, { zIndex }, gridStyle, styles.containerRow]}
    >
      {items.map(Child => <Child key={Child.key} {...props} />)}
    </Wrapper>
  );
  GridItem.key = key;
  return GridItem;
};

const createGridItem = (props) => {
  const { gridItem } = props;
  if (gridItem.type === 'label') {
    return getLabelComponent(props);
  }
  return getGeneralComponent(props);
};

const createGrid = (grid, params) => {
  const onFocus = (name) => {
    params.setField(name);
  };

  const items = grid.map((gridItem, i) => createGridItem({
    params: { ...params, onFocus },
    gridItem,
    first: i === 0,
    zIndex: grid.length - i,
    key: `${params.name}-${i}`,
  }));
  return (props) => {
    const currentStyle = props.style; // eslint-disable-line
    return (
      <Row style={currentStyle}>
        {items.map(GridItem => <GridItem key={GridItem.key} {...props} />)}
      </Row>
    );
  };
};

export default createGrid;
