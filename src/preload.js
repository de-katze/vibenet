const { CustomTitlebar, TitlebarColor } = require('custom-electron-titlebar')
const path = require('path')

window.addEventListener('DOMContentLoaded', () => {
	new CustomTitlebar({
		backgroundColor: TitlebarColor.fromHex('#00000000'),
		menuTransparency: 0.4,
		icon: path.resolve('src', 'netvibe.svg'),
	})
})