$(function(){
    var date;
    if (!Date.now) {
        date = function () { return new Date().getTime(); }
    } else {
        date = Date.now();
    }

    $('.countdown').final_countdown({
        start: '1362139200',
        end: '1474621200',
        'now': Math.floor(date / 1000),
        seconds: {
            borderColor: '#b18a53',
            borderWidth: '6'
        },
        minutes: {
            borderColor: '#b18a53',
            borderWidth: '6'
        },
        hours: {
            borderColor: '#b18a53',
            borderWidth: '6'
        },
        days: {
            borderColor: '#b18a53',
            borderWidth: '6'
        }
    });

    PostModule.init();
});

var s,
isWorking = false,
PostModule = {

  settings: {
    numArticles: 20,
    page: 1,
    postList: $('#post-list'),
    postItem: $('#post'),
    moreButton: $('#loadMoreButton'),
    loading: $('.loading'),
    affFilterBtn: $('#aff-btn'),
    twitterFilterBtn: $('#twitter-btn'),
    igFilterBtn: $('#ig-btn'),
    currentFilter: null
  },

  init: function() {
    s = this.settings;
    this.bindUIActions();
    this.getMorePosts(s.numArticles, s.page);
    this.registerHelpers();
  },
  
  registerHelpers: function(){
      Handlebars.registerHelper('eq', function( a, b ){
        var next =  arguments[arguments.length-1];
	    return (a === b) ? next.fn(this) : next.inverse(this);
        });
        
        Handlebars.registerHelper('parseTwitter', function(text){
            text = text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
		        return '<a href="'+url+'" target="_blank">'+url+'</a>';
	        });
            text = text.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
		            var username = u.replace('@','')
		            return '<a href="https://twitter.com/'+username+'" target="_blank">'+u+'</a>';
	        });
            text = text.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
		        var tag = t.replace('#','%23')
		        return '<a href="https://twitter.com/search?q='+tag+'" target="_blank">'+t+'</a>';
	        });
            
            return text;
        });
        
        Handlebars.registerHelper('parseInstagram', function(text){
            text = text.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
		        return '<a href="'+url+'" target="_blank">'+url+'</a>';
	        });
            text = text.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
		            var username = u.replace('@','')
		            return '<a href="https://instagram.com/'+username+'" target="_blank">'+u+'</a>';
	        });
            text = text.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
		        var tag = t.replace('#','')
		        return '<a href="https://instagram.com/explore/tags/'+tag+'" target="_blank">'+t+'</a>';
	        });
            
            return text;
        });
        
        Handlebars.registerHelper('formatDate', function(date_raw){
            var date = new Date(date_raw);
            var fd = date.toDateString();
            return fd;
        });
        
  },
  
  bindUIActions: function() {
    s.moreButton.on('click', function() {
        if(!isWorking){
            PostModule.getMorePosts(s.numArticles, s.page);
        }
    });
    s.affFilterBtn.on('click', function(){
            PostModule.filterPosts('aff', $(this));
    });
    s.twitterFilterBtn.on('click', function(){
            PostModule.filterPosts('twitter', $(this));
    });
    s.igFilterBtn.on('click', function(){
            PostModule.filterPosts('ig', $(this));
        
    });
  },
  
  filterPosts: function(type, btn){
      if(btn.hasClass('active')){
            $('.grid-item').show();
            btn.removeClass('active');
            s.currentFilter = null;
        }else{
            s.currentFilter = type;
            $('.filter-row .btn').removeClass('active');
            btn.addClass('active');
            if(type === 'aff'){
                $('.grid-item').not('.manual-post').hide();
                $('.manual-post').show();
            }
            if(type === 'ig'){
                $('.grid-item').not('.instagram-post').hide();
                $('.instagram-post').show();
            }
            if(type === 'twitter'){
                $('.grid-item').not('.twitter-post').hide();
                $('.twitter-post').show();
            }
        }
          s.postList.masonry('layout').masonry();
      
  },
  
  getMorePosts: function(num, page) {
      s.loading.show();
      isWorking = true;
    $.ajax({
        url: 'https://api.myjson.com/bins/2wn68',
        data: {
            page: page,
            numPosts: num
        },
        success: function(data){
            
            //sorting json data, should be sorted from data 
            data['items'].sort(function(a, b){
                var dateA=new Date(a.item_published), dateB=new Date(b.item_published)
                return dateB-dateA;
            });
            
            var source = s.postItem.html();
            var template = Handlebars.compile(source);
            var html = template(data);
          
           var container = s.postList;
                container.masonry({
                    itemSelector: '.grid-item',
                    columnWidth: '.grid-item:not([style*="display: none"])'
                });
            html = $(html).hide();
            $(container).append( html );
            $(container).masonry('reloadItems');
            s.postList.imagesLoaded(function () {
                $(html).fadeIn();
                    if(s.currentFilter !== null){
                        if(s.currentFilter === 'aff'){
                            $('.grid-item').not('.manual-post').hide();
                        }
                        if(s.currentFilter === 'twitter'){
                            $('.grid-item').not('.twitter-post').hide();
                        }
                        if(s.currentFilter === 'ig'){
                            $('.grid-item').not('.instagram-post').hide();
                        }
                    }
                    $(container).masonry('layout');
                    s.page++;
             });

        },
        error: function(data){
            console.log('error: ' + data);
        }
        
    }).then(function(){
        window.setTimeout(function(){
            s.loading.fadeOut();
            isWorking = false;
        },800);
    })
  }

};