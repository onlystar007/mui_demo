var map;
function init(id) {
	map = new plus.maps.Map(id, {
		center: new plus.maps.Point(105.156438, 30.187805),
		zoom: 11,

	});

	map.showUserLocation(true);

	location();//定位
	
	getBoundary( "资阳")
}

function getBoundary(cityname) {

	var leftbottom = new plus.maps.Point('100.446789', '26.513574'); //地图可视区域左下角坐标//103.446789
	var righttop = new plus.maps.Point('109.512239', '33.814481'); //地图可视区域右上角坐标
	var lefttop = new plus.maps.Point('100.446789', '33.814481');
	var rightbottom = new plus.maps.Point('109.512239', '26.513574');
	var maxBounds = new plus.maps.Bounds(leftbottom, righttop); //锁定区域
	var rs = ziyang.boundaries[0];
	if (rs != null && rs.length > 0) {
		var points=[];
		var tmp = rs.split(";"); //
		
		for (var i = 0; i < tmp.length; i++) {
			var t=tmp[i].split(",");
			var p=new plus.maps.Point(t[0],t[1]);
			points.push(p);
			
			//districtPLY.disableMassClear(); //禁止覆盖物在map.clearOverlays方法中被清除(自 1.1 新增)
		}
		var districtPLY = new plus.maps.Polygon(points, {
				strokeWeight: 4,
				strokeColor: "#3a7599",
				strokeOpacity: 1,
				fillColor: "#fff",
				fillOpacity: 0.01
			});
		map.addOverlay(districtPLY); //
		// 设置多边形边框为半透明
		districtPLY.setStrokeOpacity( 0.01); 
		// 设置多边形边框为红色
		districtPLY.setStrokeColor( "#ffffff" );
		// 设置多边形的填充颜色为红色
		//districtPLY.setStorkeColor( "#fff" );
		 districtPLY.setFillOpacity( 0.01 );
		 
		var startpoint = points[0]; //起始点
		var starindex = 0,
			end = 0; //起始点索引，结束点索引
		var endpoint = points[0]; //结束点
		for (var i = 0; i < points.length; i++) {
			if (points[i].longitude < startpoint.longitude) {
				startpoint = points[i]
				starindex = i;

			} else if (points[i].longitude  >= endpoint.longitude) {
				endpoint = points[i]
				end = i;

			}

		}
		
		var startpointP = new plus.maps.Point(leftbottom.longitude, startpoint.latitude);
		
		var endpointP = new plus.maps.Point(rightbottom.longitude, endpoint.latitude);
		//画出上半部和下半部覆盖区域的路径点集合
		if (starindex > end) {
			tmp = starindex;
			starindex = end;
			end = tmp;
		}
		var uprange = points.slice(starindex, end + 1);
		//console.log("uprange:"+JSON.stringify(uprange))
		var downrange = points.slice(end);
		downrange = downrange.concat(points.slice(0, starindex + 1));
		if (uprange[1].latitude  < uprange[0].latitude ) //uprange在上半区域
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
		
		var plyup = new plus.maps.Polygon(uprange);
		map.addOverlay(plyup); //上半部分覆盖区域
		plyup.setStrokeColor( "#ffffff" );
		plyup.setStrokeOpacity(0.9)
		plyup.setFillColor("#ffffff")
		plyup.setLineWidth( 0 );
		plyup.setFillOpacity( 0.9 );
		//plyup.disableMassClear(); //禁止覆盖物在map.clearOverlays方法中被清除(自 1.1 新增)
		var plyddown = new plus.maps.Polygon(downrange);
		map.addOverlay(plyddown); //下半部分覆盖区域
		//plyddown.disableMassClear(); //禁止覆盖物在map.clearOverlays方法中被清除(自 1.1 新增)
		plyddown.setStrokeColor( "#ffffff" );
		plyddown.setStrokeOpacity(0.9)
		plyddown.setFillColor("#ffffff")
		plyddown.setFillOpacity( 0.9 );
		plyddown.setLineWidth( 0 );
	}
}
function location(){
	plus.geolocation.getCurrentPosition(function(p) {
		//alert("Geolocation\nLatitude:" + p.coords.latitude + "\nLongitude:" + p.coords.longitude + "\nAltitude:" + p.coords.altitude);
		map.setCenter(new plus.maps.Point(p.coords.longitude, p.coords.latitude))
	}, function(e) {
		alert("无法获取位置信息: " + e.message);
	});
}
