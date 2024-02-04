import { useEffect } from 'react';
import { useDidHide, useDidShow, usePageNotFound } from '@tarojs/taro';
import {StoreProvider, useAppSelector, navigate} from '@/_UIHOOKS_';
import './app.scss'

function RootFix(props: any) {
	const appStore = useAppSelector(i => i);
	useEffect(() => {
		console.log(appStore)
	}, [])
	return <>{props.children}</>
}

function App(props) {
	// 可以使用所有的 React Hooks
  useEffect(() => {})

  // 对应 onShow
  useDidShow(() => {})

  // 对应 onHide
  useDidHide(() => {})
	usePageNotFound(() => {
		navigate.redirectTo({
			url: navigate.routes.pages['404'],
		})
	})
	return (
		<StoreProvider>
				<RootFix>{props.children}</RootFix>
		</StoreProvider>
	)
}

export default App
