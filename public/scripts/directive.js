Lich.directive('scatter3d',[function(){
	return {
		link:function(scope,element,attrs){
			scope.$watch('scatterInput.scores',function(scores){
				if(scores && scores.length>0){
					var data = scope.scatterInput;
					var colors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', 
   '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1']; // default highchart distinct colors

    var colorParams = {
        perturbation:{
            count:0,
            map:{}
        },
        cell:{
            count:0,
            map:{}
        },
        time:{
            count:0,
            map:{}
        }
    };
    var min = {};
    var max = {};
    var axises = ['x','y','z'];
    var seriesData = [];   
    data.items.forEach(function(item,i){
        item.viz = {};
        item.viz.colors = {};
        if(item.pert_id in colorParams.perturbation.map)
            item.viz.colors.perturbation = colorParams.perturbation.map[item.pert_id];
        else{
            item.viz.colors.perturbation = colors[colorParams.perturbation.count];
            colorParams.perturbation.map[item.pert_id] = colors[colorParams.perturbation.count]
            colorParams.perturbation.count ++;
        }
        if(item.cell in colorParams.cell.map)
            item.viz.colors.cell = colorParams.cell.map[item.cell];
        else{
            item.viz.colors.cell = colors[colorParams.cell.count];
            colorParams.cell.map[item.cell] = colors[colorParams.cell.count]
            colorParams.cell.count ++;
        }
        if(item.time in colorParams.time.map)
            item.viz.colors.time = colorParams.time.map[item.time];
        else{
            item.viz.colors.time = colors[colorParams.time.count];
            colorParams.time.map[item.time] = colors[colorParams.time.count]
            colorParams.time.count ++;
        }
        item.viz.data = {
            x:data.scores[i][0],
            y:data.scores[i][1],
            z:data.scores[i][2],
            name:[item.pert,item.cell,item.time].join(', '),
            color: item.viz.colors.perturbation
        }
        seriesData.push(item.viz.data);
        axises.forEach(function(axis){
        	if(axis in min)
        		min[axis] = item.viz.data[axis]<min[axis]?item.viz.data[axis]:min[axis];
        	else
        		min[axis] = item.viz.data[axis];

        	if(axis in max)
        		max[axis] = item.viz.data[axis]>max[axis]?item.viz.data[axis]:max[axis];
        	else
        		max[axis] = item.viz.data[axis];
        });
    });

    // Set up the chart
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'container',
            margin: 100,
            width: 600,
            type: 'scatter',
            options3d: {
                enabled: true,
                alpha: 10,
                beta: 30,
                depth: 250,
                viewDistance: 5,

                frame: {
                    // bottom: { size: 1, color: 'rgba(0,0,0,0.02)' },
                    // back: { size: 1, color: 'rgba(0,0,0,0.04)' },
                    // side: { size: 1, color: 'rgba(0,0,0,0.06)' }
                }
            }
        },
        title: {
            text: data.plotName+' plot'
        },
        subtitle: {
            text: ''
        },
        tooltip:{
            formatter: function(){
                return this.point.name
            }
        },
        plotOptions: {
            scatter: {
                width: 1,
                height: 1,
                depth: 1
            }
        },
        yAxis: {
            min: min.y,
            max: max.y,
            title: null
        },
        xAxis: {
            min: min.x,
            max: max.x,
            gridLineWidth: 1
        },
        zAxis: {
            min: min.z,
            max: max.z,
            showFirstLabel: false
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'Reading',
            colorByPoint: true,
            data: seriesData
        }]
    });


    // Add mouse events for rotation
    $(chart.container).bind('mousedown.hc touchstart.hc', function (e) {
        e = chart.pointer.normalize(e);

        var posX = e.pageX,
            posY = e.pageY,
            alpha = chart.options.chart.options3d.alpha,
            beta = chart.options.chart.options3d.beta,
            newAlpha,
            newBeta,
            sensitivity = 5; // lower is more sensitive

        $(document).bind({
            'mousemove.hc touchdrag.hc': function (e) {
                // Run beta
                newBeta = beta + (posX - e.pageX) / sensitivity;
                chart.options.chart.options3d.beta = newBeta;

                // Run alpha
                newAlpha = alpha + (e.pageY - posY) / sensitivity;
                chart.options.chart.options3d.alpha = newAlpha;

                chart.redraw(false);
            },
            'mouseup touchend': function () {
                $(document).unbind('.hc');
            }
        });
    });
		
		scope.$watch('colorParam',function(param,oldParam){
			if(param!=oldParam){
				
				seriesData.forEach(function(datum,i){
					datum.color = data.items[i].viz.colors[param];
				});
				chart.series[0].setData(seriesData,true);

				chart.series[0].data.forEach(function(datum,i){
					// Due to bug in Highchart, have to force the color update:
					datum.graphic.attr({ fill: data.items[i].viz.colors[param] })
				});

			}
		});

				} // end of "if(scores && scores.length>0)"
			});
		}
	}
}]);