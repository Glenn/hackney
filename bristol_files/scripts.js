(function( $ ){

$(document).ready( function () {

// Fix for two line menu items causing tabbing anomalies
jQuery('#block-menu-menu-top-navigation ul ul.menu').each(function (el) {
    jQuery(this).find('li:odd').addClass('even');
    jQuery(this).find('li:even').addClass('odd');
})
  // Add "bookmark-us" link to the end of the 'footer social links' section.
  $('#page-bookmark').jBrowserBookmark();

  /*
   *  Popup/Flyout Menus
   */
 
	/* Add a character before the @ in email addresses from the content left sidebar */
	
		jQuery('.contact-information-box a.email:contains("@bristol.gov.uk")').each(function() {
		var getContent=$(this).text();
		var newString=getContent.replace('@bristol.gov.uk','<br />@bristol.gov.uk');
		jQuery(this).html(newString);
		});	
	
  // add superfish to menus only on tabbing because that's all we're using it for,
  // otherwise it slows things down. make sure it only runs once, not on every tab press
  var used_tabs = false;
  jQuery('#sidebar-first,#header').live('keydown', function (e) {
    if ( e.keyCode == 9 && used_tabs == false){
        
      jQuery("ul.menu:first", '#sidebar-first .block-menu .content').superfish({
        animation:     {
          height:'show'
        },   // slide-down effect without fade-in
        delay: 0              // 1.2 second delay on mouseout
      });
      jQuery("ul.menu:first", '#block-menu-menu-top-navigation .content').superfish({
        animation:     {
          height:'show'
        },   // slide-down effect without fade-in
        delay: 0              // 1.2 second delay on mouseout
      });
      used_tabs = true;
    }
    
  });
  // if it's ie6, super fish is added in the ie6 js file

  // apply the modal to the sidebar menu
  var sidebarSettings = {
    over: sidebarMenuEnter, // function = onMouseOver callback (REQUIRED)
    interval: 150,
    timeout: 0, // number = milliseconds delay before onMouseOut
    out: sidebarMenuLeave // function = onMouseOut callback (REQUIRED)
  };
  jQuery("ul.menu:first > li", '#sidebar-first .block-menu .content').hoverIntent(sidebarSettings);

  // apply the modal to the top menu and add a few necessary fixes to stop menu 
  // items from bouncing
  var topMenuSettings = {
    over: topMenuEnter, // function = onMouseOver callback (REQUIRED)
    interval: 150,
    timeout: 0, // number = milliseconds delay before onMouseOut
    out: topMenuLeave // function = onMouseOut callback (REQUIRED)
  };
  jQuery("ul.menu:first > li", '#block-menu-menu-top-navigation .content').hoverIntent(topMenuSettings);
  
  // set a variable to indicate whether the slideshow is on the page. this is 
  // so we can turn it on/off on the over state of the menu. doing it outside the
  // menu functions so the variable is cached.
  var slideshow = jQuery('.view-id-homepage_slideshow .view-content');
  var slideshowExists = false;
  if (slideshow.length > 0) {
    slideshowExists = true;
  }
  
  
  // some functions for the menu entering/leaving
  function sidebarMenuEnter()  {
    // stop slideshow, check for the slideshow first otherwise we get errorss
    if(slideshowExists) {
      jQuery('.view-id-homepage_slideshow .view-content').cycle('pause');
    }
    
    // show the menu
    jQuery(this).addClass('flyout');
    

    // adjust the flyout so it shows closer to the top of the page
    var flyout = jQuery('ul:first',this);
    var MINIMUM_TOP_OFFSET = 135;  // top offset of the homepage flyout
    // adjust for the toolbar if logged in
    if (jQuery('body').hasClass('logged-in')){
      MINIMUM_TOP_OFFSET = MINIMUM_TOP_OFFSET + 31;
    }
    if (jQuery('body').hasClass('toolbar-drawer')){
      MINIMUM_TOP_OFFSET = MINIMUM_TOP_OFFSET + 36;
    }

    // set some variables
    var docViewTop = jQuery(window).scrollTop();
    var docViewBottom = docViewTop + jQuery(window).height();
    var flyoutTop = flyout.offset().top;
    var flyoutBottom = flyoutTop + flyout.height();

    // check if the flyout fits in the viewable area
    if ((flyoutBottom >= docViewBottom) ) {
      // get a basic new position by moving the flyout up the difference it was hidden
      var newPosition = flyoutTop-(flyoutBottom-docViewBottom);
      // check if the new position would put it out of the top of the viewable area
      if (newPosition < docViewTop) {
        newPosition = docViewTop;
        // check if it goes lower than the homepage menu
        if (newPosition <= MINIMUM_TOP_OFFSET){
          newPosition = MINIMUM_TOP_OFFSET;
        }
      }
      // check if it goes lower than the homepage menu
      if (newPosition <= MINIMUM_TOP_OFFSET){
          newPosition = MINIMUM_TOP_OFFSET;
      }
      // update position
      flyout.offset({'top':newPosition});  
    }
  }
  
  function sidebarMenuLeave()  {
    // start slideshow, check for slideshow
    if(slideshowExists) {
      jQuery('.view-id-homepage_slideshow .view-content').not('.paused').cycle('resume');
    }

    // hide the flyout
    jQuery(this).removeClass('flyout');
  }
  function topMenuEnter()  {
    // stop slideshow, check for the slideshow first otherwise we get errorss
    if(slideshowExists) {
      jQuery('.view-id-homepage_slideshow .view-content').cycle('pause');
    }
    // add classes to make the flyout work and look correct
    jQuery(this).next().addClass('adjacent-item');
    jQuery('a:first',this).addClass('fake-hover');
    jQuery(this).addClass('flyout');
  }
  function topMenuLeave() {   
    // start slideshow, check for slideshow
    if(slideshowExists) {
      jQuery('.view-id-homepage_slideshow .view-content').cycle('resume');
    }
    
    // remove classes to reset the menu
    jQuery(this).next().removeClass('adjacent-item');
    jQuery('a:first',this).removeClass('fake-hover');
    jQuery(this).removeClass('flyout');
  }
  
 

  /*
   *  Adjust line spacing
   */  
  jQuery("#adjust-line-spacing").click(function(event) {
    if (jQuery("body").hasClass('line-spacing-shim')) {
      // update body class
      jQuery("body").removeClass('line-spacing-shim');
      // update text
      jQuery(this).html('<span class="element-invisible">Change text line spacing to </span>1.5 Spacing');
      // update cookie
      jQuery.cookie('line_spacing', 'normal', {
        expires: 7,
        path: '/'
      });
    } else {
      jQuery("body").addClass('line-spacing-shim');
      // update text
      jQuery(this).html('<span class="element-invisible">Change text line spacing to </span>1.0 Spacing');
      // update cookie
      jQuery.cookie('line_spacing', 'adjusted', {
        expires: 7,
        path: '/'
      });
    }
    return false;
  });
    
});


// modernizer test for high contrast
Modernizr.testStyles('#modernizr {background-color: rgb(171,239,86)} ', function(elem, rule){
  var backgroundColor = jQuery('#modernizr').css('background-color');
  Modernizr.addTest('high-contrast', backgroundColor !== 'rgb(171, 239, 86)' 
    && backgroundColor !== 'rgb(171,239,86)'
    && backgroundColor !== '#abef56');
});

// check to see if the font size has been changed.
Modernizr.testStyles('#modernizr {font-size:13px;} ', function(elem, rule){
  var fontSize = jQuery('html').css('font-size');
  Modernizr.addTest('increased-font-size', fontSize !== '12px');
});

})( jQuery );

