/* 
chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: 'spotify.com' }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ])
  })
})

let reloading = false
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (sender.tab && sender.tab.url.includes('spotify.com')) {
    if (request.type === 'refreshExtension') {
      if (reloading) {
        return
      }
       reloading = true
      chrome.runtime.reload()
      setTimeout(() => {
      reloading = false
      }, 5000)
    }
  }
})

// Listen for a message from the content script to resize the window
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // Check if the message is to resize the window
  if (request.action === 'resizeWindow') {
    // Resize the window to the specified dimensions
    chrome.windows.getCurrent(function (currentWindow) {
      var newWidth = request.width || currentWindow.width
      var newHeight = request.height || currentWindow.height
      chrome.windows.update(currentWindow.id, {
        innerWidth: request.width || currentWindow.innerWidth,
        innerHeight: request.height || currentWindow.innerHeight
      })
    })
  }
})
chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.url.includes('/playlist/')) {
    chrome.windows.create({
      url: request.url,
      type: "app",
      width: 800,
      height: 600
    });
  }
});


*/
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === 'muteTab' || request === 'unmuteTab') {
    console.log('Muting tab')
    let tab = sender.tab
    if (tab) {
      var mutedInfo = sender.tab.mutedInfo
      if (mutedInfo !== null) {
        if (request === 'muteTab') {
          chrome.tabs.update(tab.id, {
            muted: true
          })
        } else if (request === 'unmuteTab') {
          chrome.tabs.update(tab.id, {
            muted: false
          })
        }
      }
    }
  }
})

// chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//   if (tabs[0].url.includes('spotify.com')) {
//     chrome.tabs.setZoom(tabs[0].id, 0.5)
//   }
// })

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'duplicateTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs[0]
      chrome.tabs.duplicate(tab.id, function (newTab) {
        setTimeout(function () {
          chrome.tabs.remove(tab.id)
        }, 1000)
      })
    })
  }
})
/*
chrome.runtime.onStartup.addListener(function () {
  chrome.windows.getCurrent(function (currentWindow) {
    chrome.windows.create(function (newWindow) {
      chrome.windows.remove(currentWindow.id)
    })
  })
})

chrome.runtime.onStartup.addListener(function () {
  chrome.windows.getAll(function (windows) {
    if (windows.length === 1) {
      setTimeout(function () {
        chrome.windows.create(function (newWindow) {
          chrome.windows.remove(windows[0].id)
        })
      }, Math.random() * 5000 + 1000)
    }
  })
})


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'fillLoginForm') {
    const { tabId } = sender.tab
    chrome.storage.local.get(['logins'], items => {
      const { logins } = items
      const loginUrls = Object.keys(logins)
      const matchingUrl = loginUrls.find(url => sender.url.includes(url))

      if (!matchingUrl) {
        console.log('No matching login found for this page.')
        return
      }
      const { username, password } = logins[matchingUrl]
      const scriptParams = {
        target: { tabId },
        func: (username, password) => {
          const usernameInput = document.querySelector('#login-username')
          const passwordInput = document.querySelector('#login-password')

          if (usernameInput && passwordInput) {
            usernameInput.value = username
            passwordInput.value = password
            passwordInput.form.submit()
          }
        },
        args: [username, password]
      }
      chrome.scripting.executeScript(scriptParams)
   })
  }
})

// Listen for tabs being updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
    const timer = setTimeout(function () {
      chrome.tabs.get(tabId, function (currentTab) {
        if (currentTab.status == 'loading') {
          chrome.tabs.create(
            { url: currentTab.url, index: currentTab.index + 1 },
            function (newTab) {
              chrome.tabs.remove(tabId)
            }
          )
        }
      })
    }, 2000)
    chrome.tabs.update(tabId, { timerId: timer })
  }
})

// Listen for tabs being removed
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  // Clear the timer for the tab being removed
  chrome.tabs.get(tabId, function (currentTab) {
    if (currentTab.timerId) {
      clearTimeout(currentTab.timerId)
    }
  })
})

if (false) {
// Keep track of existing tabs
var existingTabs = {}
// Listen for new tabs being created
chrome.tabs.onCreated.addListener(function (tab) {
  // Check if the URL already exists in existingTabs
  if (existingTabs[tab.url]) {
    // Close the duplicate tab
    chrome.tabs.remove(tab.id)
  } else {
    // Add the URL to existingTabs
    existingTabs[tab.url] = true
  }
})

// Listen for tabs being removed
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  // Remove the URL from existingTabs
  for (var url in existingTabs) {
    if (existingTabs.hasOwnProperty(url) && removeInfo.url == url) {
      delete existingTabs[url]
      break
    }
  }
})
}
//Set the time interval for cache clearing (in milliseconds)
const INTERVAL_TIME = 24 * 60 * 60 * 1000 // 24 hours
function clearCache () {
  chrome.browsingData.removeCache({}, () => {
    console.log('Cache cleared')
  })
}

// Set an interval to clear the cache
setInterval(clearCache, INTERVAL_TIME)

const intervalId = setInterval(() => {
  chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
    const predefinedUrl = 'https://open.spotify.com'
    const currentTab = tabs[0]
    const currentUrl = currentTab.url

    // Check if the current URL is a Chrome error page
    if (
      details.error
        .toLowerCase()
        .includes(
          'err' ||
            'error' ||
            'failed' ||
            'fail' ||
            details.url === 'chrome-error://chromewebdata/'
        )
    ) {
      console.log(currentUrl)
      // Open the predefined URL in a new tab
      chrome.tabs.update({ url: predefinedUrl })
    }
  })
}, 5000)

setTimeout(() => {
  clearInterval(intervalId)
}, 30000)

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'mute' },
        function (response) {}
      )
    })
  }
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'checkUrl' },
        function (response) {}
      )
    })
  }
})

chrome.webNavigation.onBeforeNavigate.addListener(details => {
  if (details.url.endsWith('null')) {
    chrome.management.setEnabled(
      'ailoabdmgclmfmhdagmlohpjlbpffblp',
      false,
      () => {
        chrome.management.setEnabled('ailoabdmgclmfmhdagmlohpjlbpffblp', true)
        setTimeout(() => {
          chrome.tabs.update(details.tabId, {
            url: 'https://open.spotify.com/'
          })
        }, 1000)
      }
    )
  }
})

const ERROR_REDIRECT_URL = 'https://google.com'

chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  if (details.url.startsWith('chrome-error://') || details.url.startWidth('chrome://network-error')) {
    chrome.tabs.update(details.tabId, { url: ERROR_REDIRECT_URL })
  }
})

sshark

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.toggleExtension) {
    try {
      chrome.management.setEnabled(
        'ailoabdmgclmfmhdagmlohpjlbpffblp',
        false,
        () => {
          setTimeout(() => {
            chrome.management.setEnabled(
              'ailoabdmgclmfmhdagmlohpjlbpffblp',
              true
            )
          }, 500)
        }
      )
    } catch (e) {}
  }
})

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'reload') {
    chrome.tabs.reload(sender.tab.id)
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.toggleCoherence) {
    chrome.management.setEnabled(
      'ljjajdcjopndghdamfgdgkfnocdoicaf',
      false,
      () => {
        chrome.management.setEnabled('ljjajdcjopndghdamfgdgkfnocdoicaf', true)
      }
    )
  }
})

chrome.management.setEnabled('ljjajdcjopndghdamfgdgkfnocdoicaf', false)
chrome.management.setEnabled('ljjajdcjopndghdamfgdgkfnocdoicaf', true)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.toggleEndless) {
    chrome.tabs.onCreated.addListener(tab => {
      if (
        tab.url.includes(
          'chrome-extension://ailoabdmgclmfmhdagmlohpjlbpffblp/authentication-error.html'
        )
      ) {
        chrome.tabs.remove(tab.id)
      }
    })
  }
})
try {
  chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
      return { cancel: true }
    },
    {
      urls: [
        'chrome-extension://ailoabdmgclmfmhdagmlohpjlbpffblp/authentication-error.html'
      ],
      types: ['main_frame']
    },
    ['blocking']
  )
} catch (e) {}
try {
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (
      changeInfo.url &&
      changeInfo.url.indexOf(
        'chrome-extension://ailoabdmgclmfmhdagmlohplpjlbpffblp/authentication-error.html'
      ) > -1
    ) {
      chrome.tabs.remove(tabId)
    }
  })
} catch (e) {}

try {
  chrome.webRequest.onCompleted.addListener(
    function (details) {
      console.log(details)
      // Check if the response status code is 502
      if (details.statusCode === 502) {
        // Get the current tab
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            // Reload the tab
            chrome.tabs.reload(tabs[0].id)
          }
        )
      }
    },
    { urls: ['<all_urls>'] }, // Listen for requests to all URLs
    ['responseHeaders'] // Retrieve the response headers
  )
} catch (e) {}
*/