const { CustomTitlebar, TitlebarColor } = require('custom-electron-titlebar')

window.addEventListener('DOMContentLoaded', () => {
	new CustomTitlebar({
		backgroundColor: TitlebarColor.fromHex('#00000000'),
		menuTransparency: 0.4,
		icon: `https://icon.horse/icon/${new URLSearchParams(location.search).get("title")}`
	})
})