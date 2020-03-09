/**
 * @author e87042170
 */
 var odArr=[],cables=[];
$(document).ready(function(){
	var cable_data="cable_data.json";
	var res;
	$('#sel1 option').prop('selected',false);
	$('#sel1 option:first').prop('selected',true);
	$.getJSON(cable_data, function(result){
		res=result;
		getCableSpec(res.XLPE);		
	});

	$('#sel1').change(function(){
		//alert(this.value);		
		switch(this.value){
			case "XLPE":
				getCableSpec(res.XLPE);
				break;
			case "FPVC":
			    getCableSpec(res.FPVC);
				break;
			case "CV-S":
				getCableSpec(res.CVS);
				break;
			case "PVC":
				getCableSpec(res.PVC);
				break;
			case "IPVV":
				getCableSpec(res.IPVV);
				break;
			case "ITVV":
				getCableSpec(res.ITVV);
				breal;
			case "CVVS":
				getCableSpec(res.CVVS);
				break;
			case "":
				$("#sel2").html('');
		}
	});

	var listCount=0;
	$("#addCable").click(function(){
		listCount++;
		var cType=$('#sel1').val();
		var cSpec=$('#sel2').val();
		var cOD=odArr[$('#sel2 :selected').index()];
		if(cSpec.indexOf('1/C-')>=0){
			var str='<tr>'+
		        '<td>'+listCount+'</td>'+
		        // '<td><input type="text" class="form-control" value="'+cType+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cType+' '+cSpec+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cOD+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="0"></td>'+
		        '<td><select class="form-control form-control-sm" id="selPhase"><option value="2">單相</option><option value="3" selected>三相</option></select></td>'+
		        '<td><button class="btn btn-default btn-outline-danger"> <i class="fa fa-close"></i><span class="d-none d-lg-inline"> Delete</span></button></td>'+
		        '</tr>';
		}else{
			var str='<tr>'+
		        '<td>'+listCount+'</td>'+
		        // '<td><input type="text" class="form-control" value="'+cType+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cType+' '+cSpec+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cOD+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="0"></td><td></td>'+
		        '<td><button class="btn btn-default btn-outline-danger"> <i class="fa fa-close"></i><span class="d-none d-lg-inline"> Delete</span></button></td>'+
		        '</tr>';
		}
		
		$('#tbl1 tbody').append(str);
	});
	$("#addControlCable").click(function(){
		addControlCable(res.PVC);
	});
	$("#addPowerCable").click(function(){
		addPowerCable(res.FPVC);
	});
	$("#calculate").click(function(){
		var cable=[];
		cables=[];
		$('#tbl2 tbody').empty();
	    $('#tbl1 tbody tr').each(function(){

	    	var qty=$(this).find('input:eq(2)').val();

	    	for (var i=0;i<qty;i++) {
	    		for(var j=0;j<3;j++){
	    			cable.push($(this).find('input:eq('+j+')').val());
	    		}
	    		cables.push(cable);
	    		cable=[];
	    	}
	    	//console.log(od);
	  	});
	  	if(cables.length==0){
	  		alert('請檢查電纜清單數量');
	  		return false;
	  	};
		var cableQtyP=0,cableOdP=0,cableSqrP=0,sumCableSqrP=0,factorP=0,calcConduitP=0,selConduitP=0;
		var cableQtyC=0,cableOdC=0,cableSqrC=0,sumCableSqrC=0,factorC=0,calcConduitC=0,selConduitC=0;
		var LcableSpecP='',LcableSpecC='';
	  	$('#tbl1 tbody tr').each(function(){
	  		
	    	var cableSpec=$(this).find('input:eq(0)').val();
	    	var cableType=cableSpec.substring(0,4);
	    	var qty=$(this).find('input:eq(2)').val();
	    	var maxSize=parseFloat($('#sel3').val());
	    	if(qty<1){
				return false;
			}

	    	if(cableType=="XLPE"||cableType=="FPVC"||cableType=="CV-S"){
	    		if(cableSpec.indexOf('1/C-')>=0){
	    			//單芯電源線
	    			var phase=parseInt($(this).find('select:eq(0)').val());
	    			if(qty<phase){
	    				//如果數量<相數，就不管這個項目
	    				return false;
	    			}
	    			if(qty%phase!=0){
	    				//如果數量/相數有餘數，就不管這個項目
	    				return false;
	    			}
	    			var count=qty/phase;
	    			for (var i = 0; i <count; i++) {
	    				if(i==0){
	    					LcableSpecP=cableSpec;
	    				}
	    				var LcableQtyP=cableQtyP,LcableOdP=cableOdP,LcableSqrP=cableSqrP,LsumCableSqrP=sumCableSqrP;
	    				var LfactorP=factorP,LcalcConduitP=calcConduitP,LselConduitP=selConduitP;
	    				cableQtyP=cableQtyP+phase;
				  		cableOdP=parseFloat($(this).find('input:eq(1)').val());
				  		cableSqrP=cableOdP*cableOdP;
				  		sumCableSqrP=sumCableSqrP+cableSqrP*phase;
				  		factorP=getFactor(cableQtyP);
				  		calcConduitP=conduitCalculator(sumCableSqrP,factorP);
				  		selConduitP=selectConduit(calcConduitP);
				  		if(selConduitP>maxSize){
				  			selConduitP='<span class="text-danger">'+selConduitP+' (>最大管徑)</span>'
				  		}
				  		if(calcConduitP>maxSize&&LcableQtyP!=0){
				  			var str='<tr><td>'+LcableSpecP+'</td><td class="d-none d-lg-table-cell">'+LcableOdP+'</td><td class="d-none d-lg-table-cell">'+LcableSqrP+
					  				'</td><td>'+LcableQtyP+'</td><td class="d-none d-lg-table-cell">'+LsumCableSqrP+'</td><td class="d-none d-lg-table-cell">'+LfactorP+
				  					'</td><td class="d-none d-lg-table-cell">'+LcalcConduitP+'</td><td>'+LselConduitP+'</td></tr>';
							$('#tbl2 tbody').append(str);
							cableQtyP=phase;
							sumCableSqrP=cableSqrP*cableQtyP;
							factorP=getFactor(cableQtyP);
					  		calcConduitP=conduitCalculator(sumCableSqrP,factorP);
					  		selConduitP=selectConduit(calcConduitP);
				  		}
	    			}
	    			if(cableQtyP!=0){
	    				var str='<tr><td>'+cableSpec+'</td><td class="d-none d-lg-table-cell">'+cableOdP+'</td><td class="d-none d-lg-table-cell">'+cableSqrP+
				  				'</td><td>'+cableQtyP+'</td><td class="d-none d-lg-table-cell">'+sumCableSqrP+'</td><td class="d-none d-lg-table-cell">'+factorP+
			  					'</td><td class="d-none d-lg-table-cell">'+calcConduitP+'</td><td>'+selConduitP+'</td></tr>';
						$('#tbl2 tbody').append(str);
						cableQtyP=0;
						sumCableSqrP=0;
	    			}
	    		}else{
	    			//多芯電源線
	    			for (var i = 0; i <qty; i++) {
	    				var LcableQtyP=cableQtyP,LcableOdP=cableOdP,LcableSqrP=cableSqrP,LsumCableSqrP=sumCableSqrP;
	    				var LfactorP=factorP,LcalcConduitP=calcConduitP,LselConduitP=selConduitP;
	    				cableQtyP++;
				  		cableOdP=parseFloat($(this).find('input:eq(1)').val());
				  		cableSqrP=cableOdP*cableOdP;
				  		sumCableSqrP=sumCableSqrP+cableSqrP;
				  		factorP=getFactor(cableQtyP);
				  		calcConduitP=conduitCalculator(sumCableSqrP,factorP);
				  		selConduitP=selectConduit(calcConduitP);
				  		if(calcConduitP>maxSize&&LcableQtyP!=0){
				  			var str='<tr><td>'+LcableSpecP+'</td><td class="d-none d-lg-table-cell">'+LcableOdP+'</td><td class="d-none d-lg-table-cell">'+LcableSqrP+
					  				'</td><td>'+LcableQtyP+'</td><td class="d-none d-lg-table-cell">'+LsumCableSqrP+'</td><td class="d-none d-lg-table-cell">'+LfactorP+
				  					'</td><td class="d-none d-lg-table-cell">'+LcalcConduitP+'</td><td>'+LselConduitP+'</td></tr>';
							$('#tbl2 tbody').append(str);
							cableQtyP=1;
							sumCableSqrP=cableSqrP;
				  		}
	    			}
	    			if(cableQtyP!=0){
	    				var str='<tr><td>'+cableSpec+'</td><td class="d-none d-lg-table-cell">'+cableOdP+'</td><td class="d-none d-lg-table-cell">'+cableSqrP+
				  				'</td><td>'+cableQtyP+'</td><td class="d-none d-lg-table-cell">'+sumCableSqrP+'</td><td class="d-none d-lg-table-cell">'+factorP+
			  					'</td><td class="d-none d-lg-table-cell">'+calcConduitP+'</td><td>'+selConduitP+'</td></tr>';
						$('#tbl2 tbody').append(str);
						cableQtyP=0;
						sumCableSqrP=0;
	    			}
	    		}
	    		LcableSpecP=cableSpec;
	    	}else{
				//控制線,儀錶線
				var remCable=0;
	    		for (var i = 0; i <qty; i++) {
					var LcableQtyC=cableQtyC,LcableOdC=cableOdC,LcableSqrC=cableSqrC,LsumCableSqrC=sumCableSqrC;
					var LfactorC=factorC,LcalcConduitC=calcConduitC,LselConduitC=selConduitC;
					
					cableQtyC++;
					cableOdC=parseFloat($(this).find('input:eq(1)').val());
					cableSqrC=cableOdC*cableOdC;
					sumCableSqrC=sumCableSqrC+cableSqrC;
					factorC=getFactor(cableQtyC);
					calcConduitC=conduitCalculator(sumCableSqrC,factorC);
					selConduitC=selectConduit(calcConduitC);
					if(calcConduitC>maxSize&&LcableQtyC!=0){
						var str='<tr><td>'+cableSpec+'</td><td class="d-none d-lg-table-cell">'+LcableOdC+'</td><td class="d-none d-lg-table-cell">'+LcableSqrC+
								'</td><td>'+i+'</td><td class="d-none d-lg-table-cell">'+LsumCableSqrC+'</td><td class="d-none d-lg-table-cell">'+LfactorC+
								'</td><td class="d-none d-lg-table-cell">'+LcalcConduitC+'</td><td>'+LselConduitC+'</td></tr>';
						$('#tbl2 tbody').append(str);
						cableQtyC=1;
						sumCableSqrC=cableSqrC;
						remCable=qty-i;
					}
					if((parseInt(qty)-1)==i&&parseInt(remCable)!=0){
						var str='<tr><td>'+cableSpec+'</td><td class="d-none d-lg-table-cell">'+LcableOdC+'</td><td class="d-none d-lg-table-cell">'+LcableSqrC+
						'</td><td>'+remCable+'</td><td class="d-none d-lg-table-cell">'+''+'</td><td class="d-none d-lg-table-cell">'+''+
						'</td><td class="d-none d-lg-table-cell">'+''+'</td><td>'+''+'</td></tr>';
						$('#tbl2 tbody').append(str);
						remCable=0;
					}else{
						if(cableQtyC!=0&&(parseInt(qty)-1)==i){
							var str='<tr><td>'+cableSpec+'</td><td class="d-none d-lg-table-cell">'+cableOdC+'</td><td class="d-none d-lg-table-cell">'+cableSqrC+
									'</td><td>'+qty+'</td><td class="d-none d-lg-table-cell">'+''+'</td><td class="d-none d-lg-table-cell">'+''+
									'</td><td class="d-none d-lg-table-cell">'+''+'</td><td>'+''+'</td></tr>';
							$('#tbl2 tbody').append(str);
							// cableQtyC=0;
							// sumCableSqrC=0;
						}
					}
				}
				
				remCable=0;
				LcableSpecC=cableSpec;
	    		
			}
			
		});
		if(cableQtyC!=0){
			// var str='<tr><td>'+cableSpec+'</td><td class="d-none d-lg-table-cell">'+cableOdC+'</td><td class="d-none d-lg-table-cell">'+cableSqrC+
			// 		'</td><td>'+cableQtyC+'</td><td class="d-none d-lg-table-cell">'+sumCableSqrC+'</td><td class="d-none d-lg-table-cell">'+factorC+
			// 		'</td><td class="d-none d-lg-table-cell">'+calcConduitC+'</td><td>'+selConduitC+'</td></tr>';
			var t=$('#tbl2 tbody tr:last');
			t.children('td:nth-child(5)').html(sumCableSqrC)
			t.children('td:nth-child(6)').html(factorC)
			t.children('td:nth-child(7)').html(calcConduitC)
			t.children('td:nth-child(8)').html(selConduitC)
			// cableQtyC=0;
			// sumCableSqrC=0;
		}

	});

	$('body').on('click',"#tbl1 button",function(){
		$(this).parents('tr').remove();
	});

	
		
});

function getCableSpec(cableData){
	$("#sel2").html('');
	var str='';
	odArr=[];
    $.each(cableData, function(i, data){
    	str=str+'<option>'+data.rating+' '+data.core+'-'+data.size+'</option>';	
    	odArr.push(data.od);			        
    });
    $("#sel2").append(str);
}

function getFactor(cableQty){
	if(cableQty==1){factor=0.53};
	if(cableQty==2){factor=0.31};
	if(cableQty>=3){factor=0.4};
	return factor;
}

function conduitCalculator(sumCableSqr,factor){
	return Math.sqrt(sumCableSqr/factor)/25.4;
}

function selectConduit(calcConduit){
	var selConduit;
	$('#sel3 option').each(function(){
		if(parseFloat($(this).val())>calcConduit){
			selConduit=$(this).val();
			return false;
		}
		selConduit=$(this).val();
	});
	return selConduit;
}
/**********************************				以下為測試用function				***************************************/
function addControlCable(cableData){
	//$("#sel2").html('');
	var str='';
	odArr=[];
		
    $.each(cableData, function(i, data){
    	//str=str+'<option>'+data.rating+' '+data.core+'-'+data.size+'</option>';	
    	//odArr.push(data.od);
    	var cType="PVC";		
    	//listCount++;
    	var cSpec=data.rating+' '+data.core+'-'+data.size;
		var cOD=data.od;
		
		if(cSpec.indexOf('1/C-')>=0){
			var str='<tr>'+
		        '<td>'+(i+1)+'</td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cType+' '+cSpec+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cOD+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="3"></td>'+
		        '<td><select class="form-control form-control-sm" id="selPhase"><option value="2">單相</option><option value="3" selected>三相</option></select></td>'+
		        '<td><button class="btn btn-default btn-outline-danger"> <i class="fa fa-close"></i><span class="d-none d-lg-inline"> Delete</span></button></td>'+
		        '</tr>';
		}else{
			var str='<tr>'+
		        '<td>'+(i+1)+'</td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cType+' '+cSpec+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cOD+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="6"></td><td></td>'+
		        '<td><button class="btn btn-default btn-outline-danger"> <i class="fa fa-close"></i><span class="d-none d-lg-inline"> Delete</span></button></td>'+
		        '</tr>';
		}
		
		$('#tbl1 tbody').append(str);	        
    });
    //$("#sel2").append(str);

	
}

function addPowerCable(cableData){
	//$("#sel2").html('');
	var str='';
	odArr=[];
		
    $.each(cableData, function(i, data){
    	//str=str+'<option>'+data.rating+' '+data.core+'-'+data.size+'</option>';	
    	//odArr.push(data.od);
    	var cType="FPVC";		
    	//listCount++;
    	var cSpec=data.rating+' '+data.core+'-'+data.size;
		var cOD=data.od;
		
		if(cSpec.indexOf('1/C-')>=0){
			var str='<tr>'+
		        '<td>'+(i+1)+'</td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cType+' '+cSpec+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cOD+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="3"></td>'+
		        '<td><select class="form-control form-control-sm" id="selPhase"><option value="2">單相</option><option value="3" selected>三相</option></select></td>'+
		        '<td><button class="btn btn-default btn-outline-danger"> <i class="fa fa-close"></i><span class="d-none d-lg-inline"> Delete</span></button></td>'+
		        '</tr>';
		}else{
			var str='<tr>'+
		        '<td>'+(i+1)+'</td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cType+' '+cSpec+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="'+cOD+'"></td>'+
		        '<td><input type="text" class="form-control form-control-sm" value="6"></td><td></td>'+
		        '<td><button class="btn btn-default btn-outline-danger"> <i class="fa fa-close"></i><span class="d-none d-lg-inline"> Delete</span></button></td>'+
		        '</tr>';
		}
		
		$('#tbl1 tbody').append(str);	        
    });
    //$("#sel2").append(str);

	
}