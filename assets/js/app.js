$('form').submit(function(e) {
    e.preventDefault();
    $.ajax({
        url: '/scrapeit',
        method: 'POST',
        data: $('form').serialize(),
        success: function(data) {
            console.log(data);
        },
        error: function() {
            console.log('Something went wrong!');
        }
    });
});