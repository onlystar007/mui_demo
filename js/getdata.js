//var domain = "http://192.168.1.119:89/";
var domain = "http://119.6.203.21:88/";

var userinfo
var pagesize = 20;
var zydx = {

	baseGetJson: function(url, parm, callback) {
		plus.nativeUI.showWaiting()
		mui.ajax(domain + url, {
			data: parm,
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout: 40000, //超时时间设置为5秒；
			//			headers: {
			//				'Content-Type',
			//				'application/json'
			//			}, 
			success: function(data) {
				plus.nativeUI.closeWaiting()
				console.log(url + ":" + JSON.stringify(data))
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting()
					//mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
					//mui.alert("连接服务器异常，请检查网络设置。")
				mui.toast("连接服务器异常，请检查网络设置。")
				console.log("url请求异常:" + url + JSON.stringify(parm));
				console.log("xhr:" + JSON.stringify(xhr));
				console.log("type:" + JSON.stringify(type));
				console.log("errorThrown:" + JSON.stringify(errorThrown));
			}
		});

	},
	basePostJson: function(url, parm, callback) {
		plus.nativeUI.showWaiting()
		mui.ajax(domain + url, {
			data: parm,
			dataType: 'json', //服务器返回json格式数据
			type: 'post', //HTTP请求类型
			timeout: 10000, //超时时间设置为5秒；
			//			headers: {
			//				'Content-Type',
			//				'application/json'
			//			}, 
			success: function(data) {
				plus.nativeUI.closeWaiting()
				callback(data);
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				plus.nativeUI.closeWaiting()
					//mui.alert("连接服务器异常，请检查网络设置。")
				mui.toast("连接服务器异常，请检查网络设置。")
				console.log(type);
			}
		});

	},
	changepwd:function(model,callback){
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		model.userid = userinfo.userid
		if(model.oldpwd == null || model.oldpwd.length == 0) {
			plus.nativeUI.toast("原密码不能为空");
			return;
		}
		if(model.newpwd == null || model.newpwd.length == 0) {
			plus.nativeUI.toast("新密码不能为空");
			return;
		}
		if(model.newpwd.length <6) {
			plus.nativeUI.toast("新密码必须大于等于6位");
			return;
		}
		this.basePostJson("api/app/changepwd", model, function(data) {
			if(data.Result == 100) {
				plus.nativeUI.toast("密码修改成功！")
				callback(data.Obj)
			} else {
				plus.nativeUI.toast(data.Msg);
			}
		})
	},
	//登录
	login: function(username, pwd, callback) {
		this.basePostJson('zydx/LoginSystem', {
			Login_Name: username,
			Login_Pwd: pwd
		}, function(data) {
			if(data.sucess) {
				userinfo = data.login
			}
			callback(data);

		});

	},
	downupdata: function(wgtUrl) {
		plus.downloader.createDownload(wgtUrl, {
			filename: "_doc/update/"
		}, function(d, status) {
			alert(JSON.stringify(d)+status);
			if(status == 200) {
				plus.runtime.install(d.filename, {}, function() {
					plus.nativeUI.closeWaiting();
					mui.toast("安装wgt文件成功！");
					plus.nativeUI.alert("应用资源更新完成！", function() {
						plus.runtime.restart();

					});
				}, function(e) {
					plus.nativeUI.closeWaiting();
					mui.toast("安装wgt文件失败[" + e.code + "]：" + e.message);
					//plus.nativeUI.alert("安装wgt文件失败[" + e.code + "]：" + e.message);
				});

			} else {
				mui.toast("下载wgt失败！");
			}

			plus.nativeUI.closeWaiting();

		}).start();
	},
	updateapp: function() {
		this.baseGetJson("api/app/get_appvresion", {}, function(data) {
			if(data.Result == 100) {
				plus.runtime.getProperty(plus.runtime.appid, function(inf) {
					wgtVer = inf.version;
					if(data.Obj == wgtVer) {
						return;
					} else {
						var wgtUrl = domain + "update/" + data.Obj + ".wgt"
						zydx.downupdata(wgtUrl)
					}
				});
			} else {
				mui.alert(data.Msg, "提示")
			}
		})
	},

	//首页统计图
	staticcust: function(callback) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		var strwhere = {
			roleid: userinfo.roleid,
			userid: userinfo.userid
		};
		this.baseGetJson("api/app/cust_tongjiIndex", {
			strwhere: JSON.stringify(strwhere)
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})
	},

	//首页待办
	todolist: function(pageindex, callback) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		var strwhere = {
			roleid: userinfo.roleid,
			userid: userinfo.userid,
			pageindex: pageindex,
			pagesize: pagesize
		};
		this.baseGetJson("api/app/user_todolist", {
			strwhere: JSON.stringify(strwhere)
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})
	},

	//首页预警
	yujinglist: function(pageindex, callback) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		var strwhere = {
			roleid: userinfo.roleid,
			userid: userinfo.userid,
			filterroleid: 2,
			pageindex: pageindex,
			pagesize: pagesize
		};
		this.baseGetJson("api/app/agreementwarningList", {
			strwhere: JSON.stringify(strwhere)
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})
	},

	//首页积分
	jifenlist: function(pageindex, callback) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		var strwhere = {
			roleid: userinfo.roleid,
			userid: userinfo.userid,

			pageindex: pageindex,
			pagesize: pagesize
		};
		this.baseGetJson("api/app/user_scorelist", {
			strwhere: JSON.stringify(strwhere)
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})
	},
	//客户单位列表
	custlist: function(lat, lng, pageindex, callback, key) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		var strwhere = {
			roleid: userinfo.roleid,
			userid: userinfo.userid,
			lat: lat,
			lng: lng,
			key: key,
			issure: true,
			pageindex: pageindex,
			pagesize: pagesize
		};
		this.baseGetJson("api/app/user_custlist", {
			strwhere: JSON.stringify(strwhere)
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})
	},
	//用户列表
	userlist: function(pageindex, callback, key) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		var strwhere = {
			roleid: userinfo.roleid,
			userid: userinfo.userid,
			key: key,
			pageindex: pageindex,
			pagesize: pagesize
		};
		this.baseGetJson("api/app/user_list", {
			strwhere: JSON.stringify(strwhere)
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})
	},
	//获取客户信息
	custinfo: function(custid, callback) {
		if(!custid) {
			plus.nativeUI.toast("未指定客户ID");
			return;
		}
		this.baseGetJson("api/app/user_custinfo", {
			id: custid
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})

	},
	//获取客户收人信息
	custchargeinfo: function(custid, callback) {
		if(!custid) {
			plus.nativeUI.toast("未指定客户ID");
			return;
		}
		this.baseGetJson("api/app/user_custchargeinfo", {
			id: custid
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})

	},
	//获取客户协议
	xieyilist: function(custid, state, callback) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		if(!custid) {
			plus.nativeUI.toast("未指定客户ID");
			return;
		}
		var strwhere = {
			roleid: userinfo.roleid,
			userid: userinfo.userid,
			custid: custid,
			filterroleid: state, //1:过期协议 4：进行中协议
			pageindex: 1,
			pagesize: 100
		};
		this.baseGetJson("api/app/agreementwarningList", {
			strwhere: JSON.stringify(strwhere)
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})
	},
	//更新客户单位地址
	updateaddress: function(custid, custloc, callback) {
		if(custid == null) {
			plus.nativeUI.toast("未指定客户ID");
			return;
		}
		this.basePostJson("api/app/cust_changeaddress", {
			custid: custid,
			address: custloc.address,
			lat: custloc.lat,
			lng: custloc.lng
		}, function(data) {
			if(data.Result == 100) {
				plus.nativeUI.toast("更新客户地址成功！")
				callback(data.Obj)
			} else {
				plus.nativeUI.toast(data.Msg);
			}
		})
	},
	//新建更新干系人
	updateganxiren: function(model, callback) {
		console.log(JSON.stringify(model))
		if(model.name == null || model.name.length == 0) {
			plus.nativeUI.toast("姓名不能为空");
			return;
		}
		if(model.job == null || model.job.length == 0) {
			plus.nativeUI.toast("职位不能为空");
			return;
		}
		if(model.workplace == null || model.workplace.length == 0) {
			plus.nativeUI.toast("地址不能为空");
			return;
		}
		if(model.tel == null || model.tel.length == 0) {
			plus.nativeUI.toast("电话不能为空");
			return;
		}
		if(model.cust_CUST_ID == null || model.cust_CUST_ID.length == 0) {
			plus.nativeUI.toast("客户ID不能为空");
			return;
		}
		this.basePostJson("api/app/ganxirensave", model, function(data) {
			if(data.Result == 100) {
				plus.nativeUI.toast("更新干系人信息成功！")
				callback(data.Obj)
			} else {
				plus.nativeUI.toast(data.Msg);
			}
		})
	},
	//任务、待办列表
	tasklist: function(pageindex, isend, tasktype, callback, custid) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		var strwhere = {
			roleid: userinfo.roleid,
			userid: userinfo.userid,
			task_type: tasktype, //1：任务 2：拜访
			isend: isend, //true已结束 false进行中
			pageindex: pageindex,
			pagesize: pagesize,
			cust_id: custid
		};
		this.baseGetJson("api/app/user_tasklist", {
			strwhere: JSON.stringify(strwhere)
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})
	},
	//获取任务拜访信息
	taskinfo: function(taskid, callback) {
		if(!taskid) {
			plus.nativeUI.toast("未指定ID");
			return;
		}
		this.baseGetJson("api/app/task_info", {
			id: taskid
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})

	},
	//新增任务拜访
	addtask: function(model, callback) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		if(model == null) {
			plus.nativeUI.toast("提交失败，数据异常！");
			return;
		}
		if(model.name == "" || model.name == undefined) {
			plus.nativeUI.toast("请填写名称！");
			return;
		}
		if(model.targetCustomerIds == "" || model.targetCustomerIds == undefined) {
			plus.nativeUI.toast("请选择客户单位！");
			return;
		}
		if(model.task_type == 2) //如果是拜访，指派人默认是自己
		{
			model.zhipai_userid = userinfo.userid
		}
		if(model.zhipai_userid == "" || model.zhipai_userid == undefined) {
			plus.nativeUI.toast("请选择指派人！");
			return;
		}
		if(model.endDate == "" || model.endDate == undefined) {
			plus.nativeUI.toast("请选择截止时间！");
			return;
		}

		model.createUserId = userinfo.userid;
		this.basePostJson("api/app/app_tasksave", model, function(data) {
			if(data.Result == 100) {
				plus.nativeUI.toast("添加任务成功！")
				callback(data.Obj)
			} else {
				plus.nativeUI.toast(data.Msg);
			}
		})
	},
	//接受或提交任务
	accepttask: function(model, callback) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		model.userid = userinfo.userid;
		if(model.taskid == null || model.taskid.length == 0) {
			plus.nativeUI.toast("任务ID不能为空");
			return;
		}
		if(model.state == null || model.state.length == 0) {
			plus.nativeUI.toast("状态不能为空");
			return;
		}

		this.basePostJson("api/app/accepttask", model, function(data) {
			if(data.Result == 100) {
				plus.nativeUI.toast("操作成功！")
				callback(data.Obj)
			} else {
				plus.nativeUI.toast(data.Msg);
			}
		})
	},
	//确认池
	confirmlist: function(pageindex, issure, callback) {

		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		var strwhere = {
			roleid: userinfo.roleid,
			userid: userinfo.userid,
			issure: issure,
			pageindex: pageindex,
			pagesize: pagesize
		};
		this.baseGetJson("api/app/confirm_list", {
			strwhere: JSON.stringify(strwhere)
		}, function(data) {
			if(data.Result == 100) {
				callback(data.Obj)
			} else {
				mui.alert(data.Msg, "提示")
			}
		})
	},
	//认领客户
	sureconfirm: function(model, callback) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		model.userid = userinfo.userid
		if(model.custid == null || model.custid.length == 0) {
			plus.nativeUI.toast("客户ID不能为空");
			return;
		}
		if(model.type == 2) {
			if(model.newcustid == null || model.newcustid.length == 0) {
				plus.nativeUI.toast("所属客户单位不能为空");
				return;
			}
		}
		this.basePostJson("api/app/app_custConfirm", model, function(data) {
			if(data.Result == 100) {
				plus.nativeUI.toast("认领成功！")
				callback(data.Obj)
			} else {
				plus.nativeUI.toast(data.Msg);
			}
		})
	},
	//取消认领客户
	nosureconfirm: function(model, callback) {
		userinfo = JSON.parse(plus.storage.getItem('$state'));
		if(userinfo == null) {
			callback(null)
			return;
		}
		model.userid = userinfo.userid
		if(model.custid == null || model.custid.length == 0) {
			plus.nativeUI.toast("客户ID不能为空");
			return;
		}

		this.basePostJson("api/app/app_custcancleConfirm", model, function(data) {
			if(data.Result == 100) {
				plus.nativeUI.toast("取消认领成功！")
				callback(data.Obj)
			} else {
				plus.nativeUI.toast(data.Msg);
			}
		})
	},
}