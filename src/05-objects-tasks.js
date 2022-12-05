/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return width * height;
    },
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const data = JSON.parse(json);
  const obj = Object.create(proto);

  return Object.assign(obj, data);
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class MyCSSBuilder {
  constructor() {
    this.data = [];
    this.elementUsed = false;
    this.idUsed = false;
    this.pseudoElementUsed = false;
  }

  addSelectorPart(type, value) {
    if (
      (type === 'element' && this.elementUsed)
      || (type === 'id' && this.idUsed)
      || (type === 'pseudoelement' && this.pseudoElementUsed)
    ) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }

    if (this.data.length > 0) {
      const lastPartType = this.data[this.data.length - 1].type;
      if (
        type === 'element'
        || (type === 'id' && lastPartType !== 'element')
        || (type === 'class'
          && ['attr', 'pseudoclass', 'pseudoelement'].includes(lastPartType))
        || (type === 'attr'
          && ['pseudoclass', 'pseudoelement'].includes(lastPartType))
        || (type === 'pseudoclass' && lastPartType === 'pseudoelement')
      ) {
        throw new Error(
          'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
        );
      }
    }

    if (type === 'element') {
      this.elementUsed = true;
    } else if (type === 'id') {
      this.idUsed = true;
    } else if (type === 'pseudoelement') {
      this.pseudoElementUsed = true;
    }

    this.data.push({ type, value });
    return this;
  }

  element(value) {
    return this.addSelectorPart('element', value);
  }

  id(value) {
    return this.addSelectorPart('id', value);
  }

  class(value) {
    return this.addSelectorPart('class', value);
  }

  attr(value) {
    return this.addSelectorPart('attr', value);
  }

  pseudoClass(value) {
    return this.addSelectorPart('pseudoclass', value);
  }

  pseudoElement(value) {
    return this.addSelectorPart('pseudoelement', value);
  }

  combine(selector1, combinator, selector2) {
    this.data = [
      ...selector1.data,
      { type: 'combinator', value: combinator },
      ...selector2.data,
    ];
    return this;
  }

  stringify() {
    return this.data
      .map((part) => {
        switch (part.type) {
          case 'element':
            return part.value;
          case 'id':
            return `#${part.value}`;
          case 'class':
            return `.${part.value}`;
          case 'attr':
            return `[${part.value}]`;
          case 'pseudoclass':
            return `:${part.value}`;
          case 'pseudoelement':
            return `::${part.value}`;
          case 'combinator':
            return ` ${part.value} `;
          default:
            return '';
        }
      })
      .join('');
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new MyCSSBuilder().addSelectorPart('element', value);
  },

  id(value) {
    return new MyCSSBuilder().addSelectorPart('id', value);
  },

  class(value) {
    return new MyCSSBuilder().addSelectorPart('class', value);
  },

  attr(value) {
    return new MyCSSBuilder().addSelectorPart('attr', value);
  },

  pseudoClass(value) {
    return new MyCSSBuilder().addSelectorPart('pseudoclass', value);
  },

  pseudoElement(value) {
    return new MyCSSBuilder().addSelectorPart('pseudoelement', value);
  },

  combine(selector1, combinator, selector2) {
    return new MyCSSBuilder().combine(selector1, combinator, selector2);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
