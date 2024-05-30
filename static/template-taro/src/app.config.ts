import { snakeCase } from 'lodash'
import { routes, entryPath, indexPath } from './routes'

const mixinConfig: {
	pages: string[]
	subPackages: { root: string; pages: string[] }[]
	entryPagePath: string
} = {
	pages: [],
	subPackages: [],
	entryPagePath: entryPath.slice(1)
}

for (const key in routes) {
	if (routes.hasOwnProperty(key)) {
		if (key === 'pages') {
			for (const pageskey in routes.pages) {
				const path = routes.pages[pageskey]
				if (indexPath === path) mixinConfig.pages.unshift(path.slice(1))
				else mixinConfig.pages.push(path.slice(1))
			}
		} else {
			const root = snakeCase(key)
			mixinConfig.subPackages.push({
				root,
				pages: Object.values(routes[key]).map((v: string) => v.replace(`/${root}/`, ''))
			})
		}
	}
}

export default defineAppConfig({
  ...mixinConfig,
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F7F9FF'
  }
})
