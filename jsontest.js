var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("get", url, true);
    xhr.responseType = "json";
    xhr.onreadystatechange = function() {
      if (xhr.status == 4) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();
};

getJSON("https://gitlab.com/gitlab-org/gitlab-ci-multi-runner/network/master?format=json",
function(err, data) {
  if (err != null) {
    alert("Something went wrong: " + err);
  } else {
    alert("Your query count: " + data.query.count);
  }
})