var map;
var getcurrentaddress = false;



//地图上画行政区轮廓
function getBoundary(cityName) {
	var leftbottom = new BMap.Point('100.446789', '26.513574'); //地图可视区域左下角坐标//103.446789
	var righttop = new BMap.Point('109.512239', '33.814481'); //地图可视区域右上角坐标
	var lefttop = new BMap.Point('100.446789', '33.814481');
	var rightbottom = new BMap.Point('109.512239', '26.513574');
	var maxBounds = new BMap.Bounds(leftbottom, righttop); //锁定区域
	var bdary = new BMap.Boundary();
	bdary.get(cityName, function(rs) { //
		//console.log(JSON.stringify(rs))
		//map.clearOverlays(); //
		var points;
		var count = rs.boundaries.length; //

		for (var i = 0; i < count; i++) {
			var districtPLY = new BMap.Polygon(rs.boundaries[i], {
				strokeWeight: 4,
				strokeColor: "#3a7599",
				strokeOpacity: 1,
				fillColor: "#fff",
				fillOpacity: 0.01
			}); //?????????θ?????
			map.addOverlay(districtPLY); //
			districtPLY.disableMassClear(); //禁止覆盖物在map.clearOverlays方法中被清除(自 1.1 新增)
			points = districtPLY.getPath()
				//map.setViewport(points); //
		}
		//var lockret = BMapLib.AreaRestriction.setBounds(map, map.getBounds());//锁定可视区域，不可移动
		//map.setViewport(points);
		var startpoint = points[0]; //起始点
		var starindex = 0,
			end = 0; //起始点索引，结束点索引
		var endpoint = points[0];; //结束点
		for (var i = 0; i < points.length; i++) {
			if (points[i].lng < startpoint.lng) {
				startpoint = points[i]
				starindex = i;

			} else if (points[i].lng >= endpoint.lng) {
				endpoint = points[i]
				end = i;

			}

		}

		var startpointP = new BMap.Point(leftbottom.lng, startpoint.lat);
		var endpointP = new BMap.Point(rightbottom.lng, endpoint.lat);
		//map.addOverlay(new BMap.Marker(startpointP));
		//map.addOverlay(new BMap.Marker(endpointP));
		//map.addOverlay(new BMap.Marker(startpoint));
		//map.addOverlay(new BMap.Marker(endpoint));
		//map.addOverlay(new BMap.Marker(leftbottom));
		//map.addOverlay(new BMap.Marker(lefttop));
		//map.addOverlay(new BMap.Marker(rightbottom));
		//map.addOverlay(new BMap.Marker(righttop));
		//画出上半部和下半部覆盖区域的路径点集合
		if (starindex > end) {
			tmp = starindex;
			starindex = end;
			end = tmp;
		}
		var uprange = points.slice(starindex, end + 1);
		var downrange = points.slice(end);
		downrange = downrange.concat(points.slice(0, starindex + 1));
		if (uprange[1].lat < uprange[0].lat) //uprange在上半区域
		{
			var tmp = uprange;
			uprange = downrange;
			downrange = tmp;
		}
		//map.addOverlay(new BMap.Marker(uprange[1]));
		uprange.push(startpointP);
		uprange.push(lefttop);
		uprange.push(righttop);
		uprange.push(endpointP);
		uprange.push(endpoint);
		downrange.push(endpointP);
		downrange.push(rightbottom);
		downrange.push(leftbottom);
		downrange.push(startpointP);
		downrange.push(startpoint);
		//覆盖区域样式
		var backgroundPolygonOption = {
			strokeWeight: 1,
			strokeColor: "#fff",
			fillColor: "#fff",
			fillOpacity: 0.95
		}
		var plyup = new BMap.Polygon(uprange, backgroundPolygonOption);
		map.addOverlay(plyup); //上半部分覆盖区域
		plyup.disableMassClear(); //禁止覆盖物在map.clearOverlays方法中被清除(自 1.1 新增)
		var plyddown = new BMap.Polygon(downrange, backgroundPolygonOption);
		map.addOverlay(plyddown); //下半部分覆盖区域
		plyddown.disableMassClear(); //禁止覆盖物在map.clearOverlays方法中被清除(自 1.1 新增)
	});
}
//地图上标点
var clearmarker;
function map_makepoint(lat, lng,canclear) {

	//var myIcon = new BMap.Icon("http://api0.map.bdimg.com/images/geolocation-control/point/position-icon-14x14.png", new BMap.Size(14,14));
	var marker = new BMap.Marker(new BMap.Point(lng, lat), {
		//icon: myIcon
	}); // 创建标注
	if(canclear)
	{
		clearmarker=marker
	}
	map.addOverlay(marker); // 将标注添加到地图中
	//marker.addEventListener("click", pointClick); //点击事件
	//marker.addEventListener("mouseover", overPoint); //经过事件
}
function clear()
{
	if(map!=undefined)
	{
		map.removeOverlay(clearmarker)
	}
	
}
function clearall()
{
	if(map!=undefined)
	{
		map.clearOverlays()
	}
	
}

function map_makepointbyaddress() {
	var custloc = JSON.parse(plus.storage.getItem("custloc"));
	if (custloc == null) {
		return;
	}
	if (custloc.lng == null) {
		// 创建地址解析器实例
		var myGeo = new BMap.Geocoder();
		// 将地址解析结果显示在地图上,并调整地图视野
		myGeo.getPoint(custloc.address, function(point) {
			if (point) {
				var custloc = JSON.parse(plus.storage.getItem("custloc"));
				custloc.lng = point.lng;
				custloc.lat = point.lat;
				map_makepoint(point.lat, point.lng,true)
				//有地址无坐标的情况下自动更新坐标
				var custid = plus.storage.getItem("custid");
				zydx.updateaddress(custid,custloc,function(){
					console.log("1")
					plus.webview.getWebviewById("tab-webview-subpage-cust.html").evalJS("getdata(true)")
				});
			} else {
				plus.nativeUI.toast("您选择地址没有解析到结果!");
			}
		}, "资阳市");
	} else {
		map_makepoint(custloc.lat, custloc.lng,true)
	}
}
var currentpoint; //当前坐标
var locationmarker

function mylocation() {
	plus.geolocation.getCurrentPosition(function(p) {
		//alert("Geolocation\nLatitude:" + p.coords.latitude + "\nLongitude:" + p.coords.longitude + "\nAltitude:" + p.coords.altitude);
		map.removeOverlay(locationmarker)
		currentpoint = new BMap.Point(p.coords.longitude, p.coords.latitude)
		var convertor = new BMap.Convertor();
		var pointArr = [];
		pointArr.push(currentpoint);
		convertor.translate(pointArr, 1, 5, function(data) {
				if (data.status === 0) {

					var myIcon = new BMap.Icon("http://api0.map.bdimg.com/images/geolocation-control/point/position-icon-14x14.png", new BMap.Size(14, 14));
					locationmarker = new BMap.Marker(data.points[0], {
						icon: myIcon
					});
					map.addOverlay(locationmarker); // 将标注添加到地图中
					//marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
					map.panTo(data.points[0]);
				}
			})
			//map.setCenter(curentpoint,11)

	}, function(e) {
		alert("无法获取位置信息: " + e.message);
	});
}

function events() {
	var geoc = new BMap.Geocoder();
	map.addEventListener("moveend", function(type, target) {
		if (getcurrentaddress) {
			console.log("moveend:" + JSON.stringify(map.getCenter()))
			geoc.getLocation(map.getCenter(), function(rs) {
				var addComp = rs.addressComponents;
				console.log("geoc:" + JSON.stringify(rs))
					//				mui.prompt("更新客户单位地址1", "输入地址1", "当前地址1", ["更新", "取消"], function(event) {
					//					console.log("event" + JSON.stringify(event))
					//				})
				var getaddressinput = document.getElementById("getaddressinput")
				var updatecustloc = {}
				if (getaddressinput != undefined) {
					getaddressinput.value = rs.address
				}
				updatecustloc.address=rs.address;
				updatecustloc.lng=rs.point.lng;
				updatecustloc.lat=rs.point.lat;
				plus.storage.setItem("updatecustloc",JSON.stringify(updatecustloc))
				//console.log("更新后："+plus.storage.getItem("custloc"))
				//prompt("更新地址", rs.address)

				//alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
			});
		}
	});
}

//打开原生地图导航
function navigation(dst, src) {
	if (src == undefined) {
		src = new plus.maps.Point(currentpoint.lng, currentpoint.lat); // 当前位置 
	}
	if (dst == undefined) {
		var custloc = JSON.parse(plus.storage.getItem("custloc"));
		if (custloc.lng && custloc.lat) {
			dst = new plus.maps.Point(custloc.lng, custloc.lat); // 目标位置 
		} else {
			mui.alert("还未设置客户单位地址！", "无法导航")
			return;
		}
	}

	plus.maps.openSysMap(dst, "当前位置到" + custloc.address, src);
}

function mapinit(div) {
	if (document.body.clientHeight > 100) {
		document.getElementById(div).style.height = document.body.clientHeight + "px"
	}

	// 百度地图API功能
	//alert(div);
	map = new BMap.Map(div); // 创建Map实例
	//map.centerAndZoom("资阳市",11);
	map.centerAndZoom(new BMap.Point(105.156438, 30.187805), 9);
	//map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
	//map.setCurrentCity("资阳");          // 设置地图显示的城市 此项是必须设置的
	map.enableScrollWheelZoom(true);
	map.setMinZoom(9);
	//map.setMapStyle({ style: 'light' });

	//map.disableDragging();//先禁用拖拽
	getBoundary("资阳市")
	mylocation()

	events();
}