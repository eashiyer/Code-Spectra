$(window).scroll(function() {
	var flag = false;
  if (Cibi.Auth.globalSetting) {
    if(Cibi.Auth.globalSetting.get('shrinkNavbar') === undefined){
      flag = Cibi.Auth.globalSetting.get('collapseNavbar');
    }else{
      flag = Cibi.Auth.globalSetting.get('shrinkNavbar')
    }
  }
	if(flag){
	  var verticals_height = $("#verticals_nav").height();
	  if ($(document).scrollTop() > 50) {
	    $('nav').addClass('shrink');
	 	$('.brand-image').addClass('hidden');
	 	$('.brand').css('height','28px');
	 	$('#top-account-name').removeClass('hidden');
	    $('body').css("padding-top","30px");
	    $("#verticals_nav").css('height', ($(window).height() - 98)+"px"  );
	  } else {
	    $('nav').removeClass('shrink');
	    $('.brand-image').removeClass('hidden');
	    $('.brand').css('height','50px');
	    $('#top-account-name').addClass('hidden');
	    $('body').css("padding-top","60px");
	    $("#verticals_nav").css('height', ($(window).height() - 128)+"px"  );
	  }
	}
});