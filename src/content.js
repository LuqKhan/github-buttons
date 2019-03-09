import cssText from './buttons.scss'
import { createElementInDocument } from './util'
import { apiBaseURL } from './config'
import { octicon } from './octicons'
import { fetch } from './fetch'

export const render = function (root, options, func) {
  const createElement = createElementInDocument(root.ownerDocument)

  const style = root.appendChild(createElement('style', {
    type: 'text/css'
  }))
  /* istanbul ignore if: IE lt 9 */
  if (style.styleSheet) {
    style.styleSheet.cssText = cssText
  } else {
    style.appendChild(root.ownerDocument.createTextNode(cssText))
  }

  const btn = createElement('a', {
    className: 'btn',
    href: options.href,
    target: '_blank',
    innerHTML: octicon(options['data-icon'], /^large$/i.test(options['data-size']) ? 16 : 14),
    'aria-label': options['aria-label'] || void 0
  }, [
    ' ',
    createElement('span', {}, [options['data-text'] || ''])
  ])
  if (!/\.github\.com$/.test('.' + btn.hostname)) {
    btn.href = '#'
    btn.target = '_self'
  } else if (/^https?:\/\/((gist\.)?github\.com\/[^/?#]+\/[^/?#]+\/archive\/|github\.com\/[^/?#]+\/[^/?#]+\/releases\/download\/|codeload\.github\.com\/)/.test(btn.href)) {
    btn.target = '_top'
  }

  const widget = root.appendChild(createElement('div', {
    className: 'widget' + (/^large$/i.test(options['data-size']) ? ' lg' : '')
  }, [
    btn
  ]))

  const callback = function () {
    if (func) {
      func(widget)
    }
  }

  if (!(/^(true|1)$/i.test(options['data-show-count']) && btn.hostname === 'github.com')) {
    callback()
    return
  }
  const match = btn.pathname.replace(/^(?!\/)/, '/').match(/^\/([^/?#]+)(?:\/([^/?#]+)(?:\/(?:(subscription)|(fork)|(issues)|([^/?#]+)))?)?(?:[/?#]|$)/)
  if (!(match && !match[6])) {
    callback()
    return
  }
  let api, href, property
  if (match[2]) {
    api = '/repos/' + match[1] + '/' + match[2]
    if (match[3]) {
      property = 'subscribers_count'
      href = 'watchers'
    } else if (match[4]) {
      property = 'forks_count'
      href = 'network'
    } else if (match[5]) {
      property = 'open_issues_count'
      href = 'issues'
    } else {
      property = 'stargazers_count'
      href = 'stargazers'
    }
  } else {
    api = '/users/' + match[1]
    href = property = 'followers'
  }
  fetch.call(this, apiBaseURL + api, function (error, json) {
    if (!error) {
      const data = json[property]
      widget.appendChild(createElement('a', {
        className: 'social-count',
        href: json.html_url + '/' + href,
        target: '_blank',
        'aria-label': data + ' ' + property.replace(/_count$/, '').replace('_', ' ').slice(0, data < 2 ? -1 : void 0) + ' on GitHub'
      }, [
        createElement('b'),
        createElement('i'),
        createElement('span', {}, [('' + data).replace(/\B(?=(\d{3})+(?!\d))/g, ',')])
      ]))
    }
    callback()
  })
}
