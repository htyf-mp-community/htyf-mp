import Taro, { getCurrentPages } from '@tarojs/taro'
import EventEmitter from 'eventemitter2'
const wtils = require('wtils')

import {pagesRouterConfig} from '@/routes'

import * as routes from '@/routes'

let routeArr = [];

// for (const key in routes) {
// 	if (Object.prototype.hasOwnProperty.call(object, key)) {
// 		const element = object[key];

// 	}
// }

type url = keyof typeof pagesRouterConfig

/**
 * 路由配置对象
 */
interface IRoute {
	/**
	 * 页面路径
	 */
	url: string
	/**
	 * query参数
	 */
	query?: {
		[key: string]: any
	}
}

/**
 * 生成返回事件key
 * @param path
 * @returns
 */
function createEventNameNavigateBack(path: string) {
	return `__${path}_event_key__`
}

class Route extends EventEmitter {
	/**
	 * 路由
	 */
	routes = routes.routes;
	/**
	 * 第一页
	 */
	indexPath = routes.indexPath;
	/**
	 * 启动路径（首页）
	 */
	entryPath = routes.entryPath;
	/**
	 * 返回上一页面
	 */
	navigateBack(data?: IRoute['query'] | string) {
		const curPages = getCurrentPages()
		if (curPages.length <= 1) {
			console.error('已无上层页面，无法返回')
			return
		}
		let beforePage = curPages[curPages.length - 2]; // 获取上一个页面实例对象
		let curPage = curPages[curPages.length - 1];
		console.log(beforePage, curPage)
		Taro.navigateBack({ delta: 1 })
		const curPageRoute = `${curPage?.route}`
		if (curPageRoute) {
			const eventKey = createEventNameNavigateBack(`${curPage?.route}`)
			console.log('emit eventKey:', eventKey)
			this.emit(eventKey, data)
		}
	}

	/**
	 * 页面push
	 */
	navigateTo(params: IRoute, onBack?: (data: any) => void) {
		this.jump({
			type: 'navigateTo',
			config: params,
			onBack: onBack
		})
	}

	/**
	 * 重定向
	 */
	redirectTo(params: IRoute) {
		this.jump({
			type: 'redirectTo',
			config: params,
		})
	}

	/**
	 * 重定向
	 */
	relaunch(params: IRoute) {
		this.jump({
			type: 'relaunch',
			config: params,
		})
	}

	/**
	 * 切换tabbar
	 * @param params
	 */
	switchTab(params: IRoute) {
		this.jump({
			type: 'switchTab',
			config: params,
		})
	}

	/**
	 * 跳转页面
	 */
	jump(params: {
		type: 'navigateTo' | 'redirectTo' | 'relaunch' | 'switchTab'
		config: IRoute,
		onBack?: (data: any) => void;
	}) {
		const {
			type,
			config: { url, query },
		} = params

		// url校验
		if (!url) {
			throw new Error('jump方法参数校验失败：缺少url')
		}
		if (!url.startsWith('/')) {
			throw new Error('jump方法参数校验失败：url必须以“/”开头')
		}

		let suffix = ''
		if (query && Object.keys(query).length > 0) {
			suffix = wtils.transParams(JSON.stringify(query))
		}
		const finalUrl = `${url}${suffix}`
		switch (type) {
			case 'redirectTo':
				Taro.redirectTo({
					url: finalUrl,
				})
				break
			case 'relaunch':
				Taro.reLaunch({
					url: finalUrl,
				})
				break
			case 'switchTab':
				Taro.switchTab({
					url: finalUrl,
				})
			default:
				Taro.navigateTo({
					url: finalUrl,
					success: () => {
						const eventKey = createEventNameNavigateBack(url);
						this.once(eventKey, (data) => {
							console.log('once eventKey:', eventKey, data)
							if (params?.onBack && typeof params?.onBack === 'function') {
								params?.onBack(data)
							}
						})
					}
				})
				break
		}
	}

	/**
	 * 获取当前路由
	 */
	getCurrentRoute() {
		const currentPages = getCurrentPages()
		console.log('当前页面', currentPages)

		return currentPages.length
			? currentPages[currentPages.length - 1].route
			: ''
	}

	/**
	 * 返回首页
	 */
	backToHome() {
		this.relaunch({
			url: routes.entryPath,
		})
	}
}

export const navigate = new Route();
