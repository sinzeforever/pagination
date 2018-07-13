import React from 'react'
import cls from 'classnames'
import PropTypes from 'prop-types'
import { range } from './utils/commonUtils'
import style from './Pagination.css'

const DEFAULT_DISPLAY_PAGES_COUNT = 10
const DEFAULT_MOBILE_DISPLAY_PAGES_COUNT = 5
const HIDE_ARROW_PAGE_LIMIT = 5 // hide arrow buttons when <= 5

/**
 * Given the target page, total page and display count
 * Return the numbers sequence
 * Logic: if the page has quota, the target number will be in the center
 * If there's no quota in left or right direction, the page number will not be in the center
 */
export const getPageNumbers = (target, total, count) => {
  const middle = Math.ceil(count / 2)
  const restCount = count - 1 // minus self
  const start = Math.max(Math.min(target - middle + 1, total - restCount), 1) // target - middle + 1 : center the target
  const end = Math.min(start + restCount, total)

  return range(start, end + 1)
}

/**
 * Pagination module.
 */
export class Pagination extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      currentPage: props.currentPage || 1,
      displayCount: DEFAULT_DISPLAY_PAGES_COUNT
    }
  }

  componentDidMount () {
    const parentElement = this.wrapper.parentElement || this.wrapper.parentNode
    const isParentLess768 = parentElement && parentElement.clientWidth ? parentElement.clientWidth < 768 : false
    if (global.window.innerWidth < 768 || isParentLess768) {
      this.setState({
        displayCount: DEFAULT_MOBILE_DISPLAY_PAGES_COUNT
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!isNaN(nextProps.currentPage) && nextProps.currentPage !== this.props.currentPage) {
      this.changePage(nextProps.currentPage)
    }
  }

  changePage (index, event = null) {
    if (index === this.state.currentPage) { return }

    this.setState({
      currentPage: index
    }, this.props.callback(index, event))
  }

  renderPageBtn ({ index, text, className, ...props }) {
    const { buttonElement, getUrl } = this.props
    const buttonProps = {
      ...props,
      key: text + index,
      onClick: (e) => this.changePage(index, e),
      className: cls(className, style.button),
      ...(getUrl ? { href: getUrl(index) } : {}) // if specify the way to get link, pass it as href
    }

    return React.createElement(buttonElement, buttonProps, text)
  }

  renderNumberBtn (index) {
    const { highlightStyle } = this.props
    const isHighlighted = this.state.currentPage === index
    return this.renderPageBtn({
      index,
      text: index,
      style: highlightStyle && isHighlighted ? highlightStyle : {},
      className: cls(style.numberBtn, isHighlighted && style.highlight)
    })
  }

  renderNumberBtns () {
    const { totalPages } = this.props
    const { currentPage, displayCount } = this.state
    const pages = getPageNumbers(currentPage, totalPages, displayCount)
    return (
      <div className={style.numberContainer}>
        { pages.map(index => this.renderNumberBtn(index)) }
      </div>
    )
  }

  renderLeftArrowBtn () {
    const { currentPage } = this.state
    const isDisabled = currentPage <= 1
    return this.renderPageBtn({
      index: Math.max(1, currentPage - 1),
      text: '<',
      className: cls(style.arrowBtn, style.icoArrowLeft, isDisabled && cls(style.arrowBtnDisabled, style.icoArrowLeftDisabled))
    })
  }

  renderRightArrowBtn () {
    const { currentPage } = this.state
    const { totalPages } = this.props
    const isDisabled = currentPage >= totalPages

    return this.renderPageBtn({
      index: Math.min(totalPages, currentPage + 1),
      text: '>',
      className: cls(style.arrowBtn, style.icoArrowRight, isDisabled && cls(style.arrowBtnDisabled, style.icoArrowRightDisabled))
    })
  }

  renderNextTenPagesBtn (direction) {
    const { currentPage } = this.state
    return this.renderPageBtn({
      index: currentPage + 10,
      text: '下十頁',
      className: style.tenPageBtn
    })
  }

  renderPrevTenPagesBtn (direction) {
    const { currentPage } = this.state
    return this.renderPageBtn({
      index: currentPage - 10,
      text: '上十頁',
      className: style.tenPageBtn
    })
  }

  render () {
    const { totalPages, isHideOnMobile } = this.props
    const { currentPage } = this.state

    return (
      <div ref={(wrapper) => { this.wrapper = wrapper }} className={cls(style.wrap, isHideOnMobile && style.hideOnMobile)}>
        { totalPages > HIDE_ARROW_PAGE_LIMIT && this.renderLeftArrowBtn() }
        { currentPage > 10 && this.renderPrevTenPagesBtn() }
        { this.renderNumberBtns() }
        { totalPages - currentPage >= 10 && this.renderNextTenPagesBtn() }
        { totalPages > HIDE_ARROW_PAGE_LIMIT && this.renderRightArrowBtn() }
      </div>
    )
  }
}

Pagination.propTypes = {
  /**
   * Total pages count.
   */
  totalPages: PropTypes.number.isRequired,
  /**
   * Assign currentPage from outside.
   */
  currentPage: PropTypes.number,
  /**
   * Given a method to gen url by page index. (index) => 'https://eiddccfllrbtkthuilrkeegefctljtbiicudubvjfjue.....'
   */
  getUrl: PropTypes.func,
  /**
   * When page change callback. First param is the target page index. Second param is event object or null.
   */
  callback: PropTypes.func,
  /**
   * Decide which html tag or react element to use, ex use I13nAnchor. Default is 'a'
   */
  buttonElement: PropTypes.oneOfType([ PropTypes.string, PropTypes.element, PropTypes.func ]),
  /**
   * Custom highlight style - react inline style
   */
  highlightStyle: PropTypes.object,
  /**
   * Display on mobile or not
   */
  isHideOnMobile: PropTypes.bool
}

Pagination.defaultProps = {
  callback: () => undefined,
  buttonElement: 'a',
  isHideOnMobile: false
}
