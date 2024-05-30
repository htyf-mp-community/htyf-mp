
declare namespace cocosAnalytics {
	function init(info: {
		appID: string,
		appSecret: string,
		channel: string,
		version: string,
		storeID: string,
		engine: string,
		callNumber: string,
	}): void;

	function isInited(): boolean;
	function enableDebug(enabled: boolean): void;

	namespace CAAccount {
		function loginStart(info: {
			channel: string
		}): void;
		function loginSuccess(info: {
			userID: string,
			age: number,
			sex: number,
			channel: string,
		}): void;
		function loginFailed(info: {
			reason: string,
			channel: string,
		}): void;
		function logout(): void;

		function setAccountType(type: string): void;
		function setAge(age: number): void;
		function setGender(gender: number): void;
		function setLevel(level: number): void;
		function createRole(info: {
			roleID: string,
			userName: string,
			race: string,
			class: string,
			gameServer: string
		}): void;
	}

	namespace CAPayment {
		function payBegin(info: {
			amount: number,
			currencyType: string,
			payType: string,
			iapID: string,
			orderID: string
		}): void;
		function paySuccess(info: {
			amount: number,
			currencyType: string,
			payType: string,
			iapID: string,
			orderID: string
		}): void;
		function payFailed(info: {
			amount: number,
			currencyType: string,
			payType: string,
			iapID: string,
			orderID: string
		}): void;
		function payCanceled(info: {
			amount: number,
			currencyType: string,
			payType: string,
			iapID: string,
			orderID: string
		}): void;
	}

	namespace CALevels {
		function begin(info: {
			level: string
		}): void;
		function complete(info: {
			level: string
		}): void;
		function failed(info: {
			level: string,
			reason: string
		}): void;
	}

	enum CATaskType {
		GuideLine = 0,
		MainLine = 1,
		BranchLine = 2,
		Daily = 3,
		Activity = 4,
		Other = 5
	}

	namespace CATask {
		function begin(info: {
			taskID: string,
			type: CATaskType
		}): void;
		function complete(info: {
			taskID: strign
		}): void;
		function failed(info: {
			taskID: string,
			reason: string
		}): void;
	}

	namespace CAItem {
		function buy(info: {
			itemID: string,
			itemType: string,
			itemCount: number,
			virtualCoin: number,
			virtualType: string,
			consumePoint: string
		}): void;
		function get(info: {
			itemID: string,
			itemType: string,
			itemCount: number,
			reason: string
		}): void;
		function consume(info: {
			itemID: string,
			itemType: string,
			itemCount: number,
			reason: string
		}): void;
	}

	namespace CAVirtual {
		function setVirtualNum(info: {
			type: string,
			count: number
		}): void;
		function get(info: {
			type: string,
			count: number,
			reason: string
		}): void;
		function consume(info: {
			type: string,
			count: number,
			reason: string
		}): void;
	}

	namespace CAAdvertising {
		function begin(info: {
			adID: string,
		}): void;
		function complete(info: {
			adID: string,
			timeLong: number,
			profit: string
		}): void;
		function failed(info: {
			adID: string,
			reason: string
		}): void;
	}

	namespace CACustomEvent {
		function onStarted(name: string, info: {
			name: string
		} | any): void;
		function onSuccess(name: string, info: {
			name: string
		} | any): void;
		function onCancelled(name: string, info: {
			name: string
		} | any): void;
		function onFailed(name: string, info: {
			name: string
		} | any, result: string): void;
	}
}
