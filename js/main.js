// Run On Page Load
$(window).on("load", function() {

    //Preloader
    $('#loader-wrapper').fadeOut(1600, function() { $(this).remove(); });

    /* activate jquery isotope */
    var $container = $('#portfolio-container');
    $container.isotope({
        masonry: {
            columnWidth: '.portfolio-item'
        },
        itemSelector: '.portfolio-item'
    });
    $('#filters').on('click', 'li', function() {
        $('#filters li').removeClass('active');
        $(this).addClass('active');
        var filterValue = $(this).attr('data-filter');
        $container.isotope({ filter: filterValue });
    });

    $('#lionhero').owlCarousel({
        nav: true,
        navText: [
            "PREV",
            "NEXT"
        ],
        items: 1,
        navSpeed: 400,
        loop: true,
        autoplay: true,
        autoplayTimeout: 4000,
        autoplayHoverPause: true,
    });

    $('#lionportfolio').owlCarousel({
        nav: true,
        navText: [
            "PREV",
            "NEXT"
        ],
        items: 1,
        navSpeed: 400,
        loop: true,
        autoplay: true,
        autoplayTimeout: 4000,
        autoplayHoverPause: true,
    });

    $("#liontestimonial").owlCarousel({

        nav: true,
        navText: [
                '<i class="fa fa-angle-left"></i>',
                '<i class="fa fa-angle-right"></i>'
            ],
        items: 1,
        navSpeed: 400,
        loop: true, 
        dots: true,
        autoplay: true,
        autoplayTimeout: 4000,
        autoplayHoverPause: true,
        responsive: {
            1024: {
                items: 1
            }
        }
    });


});

$(document).ready(function() {

    $('#pagepiling').pagepiling({
        menu: '#menu',
        anchors: ['page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7'],
        navigation: {
            'textColor': '#f2f2f2',
            'bulletsColor': '#ccc',
            'position': 'right',
            'tooltips': ['DUNE PHOTO STUDIO', 'PORTFOLIO', 'ABOUT', 'SERVICES', 'PRICES', 'BLOG', 'CONTACT']
        }
    });


});

function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
    document.getElementById("mynav").style.display = "none";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("mynav").style.display = "block";
}
