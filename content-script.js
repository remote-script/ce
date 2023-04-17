function at (origin, path = '') {
  const l = window.location
  return l.origin.includes(origin) && l.pathname.includes(path)
}

function colorProgressBar (h, s = 100, l = 50) {
  const progressBar = document.querySelector('[data-testid=progress-bar]')
  if (!progressBar) {
    return
  }
  progressBar.style.setProperty('--fg-color', `hsl(${h}, ${s}%, ${l}%)`)
}

function progressBarStatus () {
  const playbackProgressBar = document.querySelector(
    '[data-testid=playback-progressbar]'
  )
  if (!playbackProgressBar) {
    return false
  }
  return playbackProgressBar.children[1].style.cssText.match('[0-9.]+')[0]
}

function skip (delay = true) {
  const skipButton = document.querySelector(
    '[data-testid=control-button-skip-forward]'
  )
  if (
    document.title === 'Spotify – Advertisement' ||
    !document.querySelector('footer')
  ) {
    return
  }
  if (delay) {
    const contextItemInfoArtist = document.querySelector(
      '[data-testid=context-item-info-artist]'
    )
    if (contextItemInfoArtist?.innerText?.match(/westgard|lockwood/i)) {
      colorProgressBar(100)
      return
    }
    const progressBarStatusValue = progressBarStatus()
    if (!progressBarStatusValue) {
      return
    }
    const randomValue = Math.random() * 30 + 45
    const hue = (1 - progressBarStatusValue / randomValue) * 120
    colorProgressBar(hue)
    const playbackPosition =
      document
        .querySelector('[data-testid=playback-position]')
        ?.innerText?.match(/:([0-9]{2})$/)?.[1] || 0
    if (playbackPosition > 30 && progressBarStatusValue > randomValue) {
      skipButton.click()
    }
  } else {
    skipButton.click()
  }
}

/*
  const r = document.querySelector('[data-testid=control-button-repeat]')
  const s = document.querySelector('[data-testid=control-button-shuffle]')
  r !== null && !r.ariaLabel.includes('Enable repeat one') && r.click()
  s !== null && !s.ariaLabel.includes('Disable shuffle') && s.click()
*/
function repeatAndShuffle () {
  if (document.title.includes('dvertisement')) {
    return
  }
  const r = document.querySelector('[data-testid=control-button-repeat]')
  const s = document.querySelector('[data-testid=control-button-shuffle]')
  r !== null && !r.ariaLabel.includes('Enable repeat one') && r.click()
  s !== null && !s.ariaLabel.includes('Disable shuffle') && s.click()
}

function configBanner (status, bgColor) {
  const banner =
    document.getElementById('endless') ||
    document.body.appendChild(document.createElement('div'))
  banner.id = 'endless'
  banner.innerHTML = status
  banner.style.cssText = `
    width: 100%;
    height: 80px;
    background: ${bgColor};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    position: fixed;
    top: 0;
    left: 0;
    cursor: pointer;
    font-size: 40px;
    font-family: monospace;
  `

  banner.addEventListener('dblclick', () => {
    location.reload(true)
    chrome.runtime.sendMessage({ type: 'refreshExtension' })
  })
}
function configBanner (status, bgColor = 'orange') {
  const banner =
    document.getElementById('endless') ||
    document.body.appendChild(document.createElement('div'))
  banner.id = 'endless'
  banner.innerHTML = status
  banner.style.cssText = `
    width: 100%;
    height: 80px;
    background: ${bgColor};
    color: white;
    display: block;
    z-index: 999;
    position: absolute;
    text-align: center;
    top: 0px;
    cursor: pointer;
    font-size: 40px;
    font-family: monospace;
  `
  banner.addEventListener('dblclick', () => {
    document.location.reload(true)
    chrome.runtime.sendMessage({ type: 'refreshExtension' })
  })
}

function paused (startPlay = false) {
  const playButton = document.querySelector('[data-testid=play-button]')
  if (!playButton) {
    return false
  }
  const isPaused = playButton.firstChild.innerHTML.match(/z/g).length === 1
  if (isPaused) {
    if (startPlay) {
      playButton.click()
    } else {
      return true
    }
  } else {
    return false
  }
}

function play () {
  const controls = document.querySelector('.player-controls')
  if (!controls) {
    return
  }
  const playButton = controls.querySelector('[data-testid=play-button]')
  if (playButton) {
    playButton.click()
    return
  }
  const track = document.querySelector(
    '[data-testid=tracklist-row] [aria-label*=Play]'
  )
  if (track) {
    track.click()
    return
  }
  const button = Array.from(controls.querySelectorAll('button')).find(i =>
    i.innerText.includes('z')
  )
  if (button && !button.disabled) {
    button.click()
  }
}

function closeDialog () {
  const selectors = [
    '[class*=banner-close-button]',
    '#onetrust-accept-btn-handler',
    '[data-testid=dialog-root]',
    '[role=dialog]'
  ]
  const dialog = document.querySelector(selectors.join(','))

  if (!dialog) {
    return
  }

  if (
    dialog.classList.contains('banner-close-button') ||
    dialog.id === 'onetrust-accept-btn-handler'
  ) {
    dialog.click()
  } else if (dialog.getAttribute('data-testid') === 'dialog-root') {
    const closeButton = dialog.nextElementSibling?.firstElementChild
    if (closeButton?.innerText === 'Close') {
      closeButton.click()
    }
  } else if (dialog.getAttribute('role') === 'dialog') {
    const webView = document.querySelector(
      '[data-testid=inAppMessageContainer] [class*=webview i]'
    )
    if (!webView) {
      return
    }
    webView.style.zoom = '50%'
    const dismissButton = webView.contentDocument.querySelector(
      '[data-click-to-action-id=dismiss_action i]'
    )
    if (dismissButton) {
      dismissButton.click()
    }
  }
}

function clickRandomTrack () {
  const playlistPage = document.querySelector('[data-testid=playlist-page]')
  if (!playlistPage) {
    return
  }
  const tracks = playlistPage.querySelectorAll('[aria-label*=Play]')
  if (!tracks.length) {
    return
  }
  const randomTrack = tracks[Math.floor(Math.random() * tracks.length)]
  randomTrack.scrollIntoView()
  randomTrack.dispatchEvent(
    new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
      view: window
    })
  )
  playlistPage.scrollIntoView()
}

function progressBar () {
  let progressBar = document.querySelector('[data-testid=progress-bar]')
  if (!progressBar) {
    return 0
  }
  progressBar = progressBar.style.cssText
  progressBar = progressBar.match(/[0-9.]+/)
  progressBar =
    progressBar === null
      ? 100
      : progressBar.length > 1
      ? parseFloat(progressBar[0])
      : parseFloat(progressBar)
  if (progressBar === 100) {
    skip(false)
  }
  return progressBar
}

async function stuck (status = false) {
  const start = progressBar()
  await new Promise(resolve => setTimeout(resolve, 1000))
  if (progressBar() === start) {
    if (status) {
      return true
    }
    clickRandomTrack()
  } else {
    return false
  }
}

function config (reload = false) {
  const userWidgetName = document.querySelector(
    '[data-testid=user-widget-name]'
  )
  const config = JSON.parse(document.querySelector('#config').innerHTML)
  const { userCountry: user, market } = config
  const country = user === market ? `(${market})` : `(${user}, ${market})`
  return `${userWidgetName?.innerText ?? ''} ${country}`
}

function toOrigin (msg = '') {
  if (msg) {
    console.info(`Back to origin: ${msg}`)
  }
  window.location.href = window.origin
}

function checkDisabledPlayerControls () {
  try {
    const playerControls = document.querySelector('.player-controls')
    const button = Array.from(playerControls.children).find(i =>
      i.tagName.match(/button/i)
    )
    if (
      button &&
      !button.disabled &&
      button.nextElementSibling.firstChild.disabled &&
      button.previousElementSibling.lastChild.disabled
    ) {
      toOrigin('Some player controls are disabled.')
    }
  } catch (error) {
    console.error(error)
  }
}

function checkTrustyIds () {
  if (!document.querySelectorAll('[id*=onetrust]').length) {
    toOrigin('No trusty ids.')
  }
}

function checkReloadPageElements () {
  document.querySelectorAll('span').forEach(i => {
    try {
      const reloadPage = i.innerText.match(/reload page/i)
      if (reloadPage) {
        i.parentNode.click()
      }
    } catch (error) {
      console.error(error)
    }
  })
}

function checkPlaylistNotFoundElements () {
  document.querySelectorAll('p').forEach(i => {
    try {
      const playlistNotFound = i.innerText.match(/couldn't find that playlist/i)
      if (playlistNotFound) {
        toOrigin('Playlist not found.')
      }
    } catch (error) {
      console.error(error)
    }
  })
}

async function checkAdvertisement () {
  try {
    const closeBtnContainer = document.querySelector(
      '#onetrust-close-btn-container'
    )
    const acceptBtnHandler = document.querySelector(
      '#onetrust-accept-btn-handler'
    )

    if (closeBtnContainer) {
      closeBtnContainer.firstChild.click()
    }
    if (acceptBtnHandler) {
      acceptBtnHandler.click()
    }
    if (document.title === 'spotify – Advertisement') {
      await stuck()
    }
  } catch (error) {
    console.error(error)
  }
}

function checkUpstreamError () {
  try {
    const pre = document.querySelector('body > pre')
    if (pre && pre.innerText.includes('upstream')) {
      window.navigation.back()
      setTimeout(() => {
        window.navigation.forward()
      }, 1000)
      toOrigin('Upstream error')
    }
  } catch (error) {
    console.error(error)
  }
}

function check502BadGateway () {
  try {
    const title = document.title
    if (title && title.match(/502 bad gateway/i)) {
      toOrigin('502 Bad Gateway server error.')
    }
  } catch (error) {
    console.error(error)
  }
}

function checkPageNotFound () {
  if (document.title === 'Page not found') {
    toOrigin('Page not found')
  }
}

function checkSomethingWentWrongPopup () {
  const heading = document.querySelector('h1')
  if (heading && heading.innerText.includes('Something went wrong')) {
    toOrigin('"Something went wrong" popup message.')
  }
}

function reloadWhen () {
  // Check if the document has finished loading
  if (document.readyState !== 'complete') {
    return
  }

  try {
    // If on a Spotify playlist page, perform various checks
    if (at('open.spotify', '/playlist/')) {
      checkDisabledPlayerControls()
      checkTrustyIds()
      checkReloadPageElements()
      checkPlaylistNotFoundElements()
      checkUpstreamError()
      checkSomethingWentWrongPopup()
    }

    // Perform additional checks regardless of page type
    checkPageNotFound()
    check502BadGateway()
  } catch (error) {
    console.error(error)
  }
}

function goToLogin () {
  const loginButton = document.querySelector('[data-testid=login-button]')
  if (loginButton) {
    window.location.href =
      'https://accounts.spotify.com/login?continue=https%3A%2F%2Fopen.spotify.com'
  }
}

function firstPlaylist () {
  // Find the rootlist element
  let rootlist = document.querySelector('[data-testid="rootlist"]')

  // If it doesn't exist, return false
  if (!rootlist) {
    return false
  }

  // Find all playlist links in the rootlist element
  const playlists = rootlist.querySelectorAll('[href*=\\/playlist\\/]')

  // If there's only one playlist and we're not already on a playlist page,
  // click on that playlist link and return true. Otherwise, return false.
  if (playlists.length === 1 && !at('open.spotify', '/playlist/')) {
    playlists[0].click()
    return true
  } else {
    return false
  }
}

function deletePlaylist () {
  // Find the action bar row button and click it to open the menu
  const actionBarRowButton = document.querySelector(
    '[data-testid=action-bar-row] > button'
  )
  actionBarRowButton.click()

  setInterval(() => {
    const tippyRoot = document.querySelector('[data-tippy-root]')

    if (tippyRoot) {
      // Find the "delete" option in the menu and click it
      const deleteButton = [
        ...document.querySelectorAll('[role=menuitem]')
      ].find(i => i.innerText.match(/delete/i))
      if (deleteButton) {
        deleteButton.click()
      }
    }

    const deleteDialog = document.querySelector('[aria-label*=Delete]')

    if (deleteDialog) {
      // Click on "Delete" button in confirmation dialog box
      deleteDialog.querySelector('button:last-of-type').click()
    }
  }, 500)
}

function userPlaylist () {
  const userWidgetName = document.querySelector(
    '[data-testid=user-widget-name]'
  )

  const creatorLink = document.querySelector('[data-testid=creator-link]')

  if (
    userWidgetName &&
    creatorLink &&
    userWidgetName.innerText !== creatorLink.innerText
  ) {
    return false
  } else if (
    creatorLink &&
    (userWidgetName.innerText === creatorLink.innerText ||
      (creatorLink.innerText.includes('spotify') &&
        document
          .querySelector('[data-testid=entityTitle]')
          .nextSibling.innerText.includes('Benjamin Westgard')))
  ) {
    return true
  }

  return false
}

function getPlaylist () {
  let playlists = document.querySelector('[data-testid="rootlist"]')

  if (!playlists) return

  playlists = playlists.querySelectorAll('[href*=\\/playlist\\/]')

  if (playlists.length === 0) return

  if (firstPlaylist()) {
    if (playlists.length > 0) playlists[0].click()
    return
  }

  let i = 0

  const findPlaylist = setInterval(() => {
    if (userPlaylist()) {
      // If we're on the user's playlist page, check for a tracklist element.
      // If it doesn't exist, delete the playlist. Then blur focus from any active link and clear interval.
      if (!document.querySelector('[data-testid=playlist-tracklist]')) {
        deletePlaylist()
      }
      const a = document.activeElement
      if (a.tagName === 'A' && a.href.includes('/playlist/')) a.blur()
      clearInterval(findPlaylist)
      return
    }

    // Click on next playlist in list until we reach the end or find user's playlist
    playlists[i++].click()
  }, 1000)
}

function userID () {
  // const userIDCookie = document.cookie.includes('userID')
  // if (!userIDCookie) {
  const userLink = document.querySelector('[href*=user]')
  if (userLink !== null) {
    const userID = userLink.pathname.replace('/user/', '')
    document.cookie = `userID=${userID}; path=/; domain=open.spotify.com`
  }
  // }
}

function navbarWidth () {
  let navBarWidthKeys = Object.keys(localStorage).filter(
    i => i.includes(':nav-bar-width') && !i.includes('anonymous')
  )
  if (navBarWidthKeys.length > 1) {
    navBarWidthKeys.forEach(key => {
      localStorage.removeItem(key)
    })
    const userIDCookie = document.cookie
      .split('; ')
      .find(i => i.startsWith('userID'))
    const userID = userIDCookie ? userIDCookie.split('=')[1] : null
    const navBarWidthKey = `${userID}:nav-bar-width`
    localStorage.setItem(navBarWidthKey, '120')
  }
}

function randomVolume () {
  localStorage.setItem('playback', `{"volume":${0.5 + Math.random() * 0.5}}`)
}

function closeAlerts () {
  window.addEventListener('beforeunload', e => {
    e.preventDefault()
    e.returnValue = ''
  })
}

function useThisWindow () {
  const nowPlayingBar = document.querySelector('[class*=now-playing-bar]')
  if (nowPlayingBar && nowPlayingBar.querySelector('[aria-live=polite]')) {
    const controlButton = document.querySelector(
      '[class*=control-button--active]'
    )
    controlButton.click()
    setTimeout(() => {
      try {
        const contextMenu = document.querySelector('#context-menu')
        const thisWebBrowserOption = contextMenu.querySelector(
          '[aria-label="This web browser"]'
        )
        thisWebBrowserOption.click()
        const tippyRoot = document.querySelector('[data-tippy-root]')
        if (tippyRoot) {
          tippyRoot._tippy.hide()
        }
      } catch (e) {
        console.error(e)
      }
    }, 1000)
  }
}

function muteTab () {
  try {
    chrome.runtime.sendMessage({ action: 'muteTab' })
    chrome.runtime.sendMessage('muteTab', response => {})
  } catch (error) {
    console.error(error)
  }
}

function dupTab () {
  chrome.runtime.sendMessage({ action: 'duplicateTab' })
}

function setZoom () {
  try {
    document.body.style.cssText =
      'zoom: 50%; margin-top: 65px; height: calc(100% - 65px);'
  } catch (error) {
    console.error(error)
  }
}

function clearData () {
  try {
    sessionStorage.clear()
    localStorage.clear()
    const indexedDBRequest = indexedDB.deleteDatabase('databaseName')
    indexedDBRequest.onsuccess = () => {}
    indexedDBRequest.onerror = () => {}
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister()
      }
    })
    caches.keys().then(cacheNames => {
      for (const cacheName of cacheNames) {
        caches.delete(cacheName)
      }
    })
  } catch (error) {
    console.error('Error clearing data:', error)
  }
}

// Initialize variables for controlling program flow
let inactive = true
let tries = 0
let i = 0
// Set up a timer to run every second and check if Spotify is open
const w = setInterval(() => {
  // Check if the current URL contains "open.spotify"
  if (at('open.spotify')) {
    // If it does, mute the tab, set zoom level, randomize volume,
    // get user ID, and adjust navbar width as needed.
    muteTab()
    setZoom()
    randomVolume()
    userID()
    navbarWidth()
  }

  // Check if the document has finished loading. If so, clear this interval.
  if (document.readyState === 'complete') {
    clearInterval(w)
  } else if (i > 30) {
    clearData()
    dupTab()
  }
  i++
}, 1000)

// Set up another timer to run every two seconds once the page has loaded
const main = setInterval(async () => {
  // If the document isn't fully loaded yet, return early and wait for next iteration.
  if (document.readyState !== 'complete') {
    return

    // Handle password reset pages by redirecting back to login page after completion
  } else if (at('open.spotify', 'password-reset/complete')) {
    window.open('https://open.spotify.com/', '_self')
  } else if (at('accounts.spotify')) {
    /* Handle login page */

    // Click on web player link in status message at top of screen
    const h1InnerText = document.querySelector('h1').innerText
    const ban = document.querySelector('[data-encore-id=banner]')

    /* Handle incorrect username/password error */
    if (ban !== null && ban.innerText.includes('Incorrect')) {
      const resetThisValue = document.querySelector('#login-username').value

      /* Store value entered into username field in a cookie */
      document.cookie = `resetThis=${resetThisValue}; path=/; domain=accounts.spotify.com`

      // Click on reset password link
      document.querySelector('#reset-password-link').click()
    } else if (h1InnerText === 'Password Reset') {
      /* Handle password reset page */

      // Get username from cookie and enter it into email/username field
      const usr = document.cookie
        .split('; ')
        .find(i => i.startsWith('resetThis'))
      I('id=email_or_username', usr.split('=')[1])

      // Click the submit button to initiate password reset process
      document.querySelector('button').click()
    }

    clearInterval(main)
    return
  } else if (
    !at('open.spotify') ||
    !document.head.innerHTML.includes('web-player')
  ) {
    /* If not on Spotify or web player is not loaded, return early and wait for next iteration. */
    return
  }

  /* Handle logged in state */

  goToLogin() // Navigate to login page if needed

  muteTab() // Mute tab audio

  setZoom() // Set zoom level as needed

  checkAdvertisement() // Check for ads and close them as needed

  closeDialog() // Close any open dialogs that may interfere with playback

  useThisWindow() // Focus on current window/tab

  getPlaylist() // Retrieve playlist information

  inactive = await stuck(true)

  configBanner(config(), inactive ? 'red' : 'green')

  /* If user has been inactive, try different methods of resuming playback */

  if (inactive) {
    if (tries <= 1) {
      console.log('at playlist')
      paused() && play()
    } else if (tries > 2 && tries <= 5) {
      console.info(`used \`skip(false)\` after ${tries} tries`)
      paused() && skip(false)
    } else if (tries > 5 && tries <= 10) {
      console.info(`used \`await stuck()\` after ${tries} tries`)
      try {
        paused() && (await stuck())
      } catch (error) {
        console.error(error)
      }
    } else if (tries > 10) {
      clearData()
      dupTab() // Duplicate the current tab
      console.log('Duplicate the current tab')
    }

    tries++
    console.info(tries)

    /* If user is active and playback is not paused, repeat and shuffle playlist */
  } else if (at('open.spotify.com', '/playlist/')) {
    if (!inactive && !paused()) {
      repeatAndShuffle()
      tries = 0
      skip(true)
      console.log('If user is active but playback is paused, resume playback')
      /* If user is active but playback is paused, resume playback */
    } else {
      console.log('Resume playback')
      paused(true) // Resume playback
    }
  }
  try {
    userID()
  } catch (error) {
    console.error(error)
  }
}, 2000)
