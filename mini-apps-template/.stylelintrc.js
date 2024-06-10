/**
 * 具体文档
 * https://stylelint.docschina.org/user-guide/rules/
 */
module.exports = {
  "extends": "stylelint-config-standard-scss",
  "plugins": ["stylelint-scss"],
  "rules": {
    /** 选择器组合器不允许列表 */
    "selector-combinator-disallowed-list": [
      ["+", " ", "~", ">"],
      {
        "message": "选择器组合器不允许"
      }
    ],
    /** 指定禁用的伪元素选择器的黑名单 */
    "selector-pseudo-element-disallowed-list": [],
    /** 禁止选择器的浏览器引擎前缀 */
    "selector-no-vendor-prefix": true,
    /** 禁止用类型选择器来限定一个选择器 */
    "selector-no-qualifying-type": true,
    "selector-id-pattern": [
      "!\\*",
      {
        "message": "禁用id选择器"
      }
    ],
    /** 限制一个选择器中类型选择器的数量 */
    "selector-max-type": [
      1,
      {
        "message": "限制一个选择器中类型选择器的数量为 1 个"
      }
    ],
    /** 限制选择器中的类数量 */
    "selector-max-class": [
      1,
      {
        "message": "限制选择器中的类数量为 1 个"
      }
    ],
    /** 限制选择器中 ID 选择器的数量 */
    "selector-max-id": [
      1,
      {
        "message": "禁用id选择器"
      }
    ],
    /** 限制选择器中组合器的数量 */
    "selector-max-combinators": [
      1,
      {
        "message": "限制选择器中组合器的数量为 1 个"
      }
    ],
    /** 指定类选择器的模式 */
    // "selector-class-pattern": [
    //   "^(_UIHOOKS_|[a-z])[a-z-]*$",
    //   {
    //     "message": removeLeadingTrailingSpaces(`
    //       类名规则为
    //     `)
    //   }
    // ],
    /** 禁止关键帧声明的 !important */
    "keyframe-declaration-no-important": [
      true,
      {
        "message": "禁止关键帧声明的 !important "
      }
    ],
    /** 禁止声明的 !important */
    "declaration-no-important": [
      true,
      {
        "message": "禁止声明的 !important"
      }
    ],
    /** 禁止可合并为一个简写属性的扩写属性 */
    "declaration-block-no-redundant-longhand-properties": null,
    /** 要求或禁止在注释之前的空行（可自动修复） */
    "comment-empty-line-before": null,
    /** 禁止未知的@规则 */
    "at-rule-no-unknown": null,
    /** 声明属性单元不允许列表 */
    "declaration-property-unit-disallowed-list": [
      {
        "/^border-radius/i": ["%"],
        "/^background/i": ["url"],
        "/^margin/i": ["auto"],
      },
      {
        "message": removeLeadingTrailingSpaces(`
          1. border-radius属性的单位不允许'%', 圆形可以设置一个 99999px 
          2. position不能用fixed
          3. margin不能用auto, 可用 flex 布局去居中
        `)
      },
    ],
    /** 声明属性值不允许列表 */
    "declaration-property-value-disallowed-list": [
      {
        "/^background/i": ["/url\\(/", "none"],
        "position": "fixed",
        "box-shadow": "/\.\*/",
        "width": "/auto/",
        "height": "/auto/",
      },
      {
        "message": removeLeadingTrailingSpaces(`
          1. background不能用在线图 
          2. position不能用fixed
          3. box-shadow禁用
          4. font-family禁用
          5. width height禁用auto
        `)
      },
    ],

    "color-function-notation": [
      "legacy",
    ],
    "alpha-value-notation": "number",
    
    "scss/at-rule-no-unknown": true,
    "scss/selector-no-redundant-nesting-selector": true
  }
}

function removeLeadingTrailingSpaces(text) {
  return text.replace(/^\s+|\s+$/gm, '');
}