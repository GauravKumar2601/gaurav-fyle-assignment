const ACCESS_TOKEN = "";
// Replace 'YOUR_GITHUB_USERNAME' with the desired GitHub username
const githubUsername = "johnpapa";

// GitHub API endpoint for user data
const apiUrl = `https://api.github.com/users/${githubUsername}`;

// GitHub API endpoint for user repositories
const reposUrl = `https://api.github.com/users/${githubUsername}/repos?per_page=100`;

// Fetch user data using the fetch API
fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    $("#profile-image").attr("src", data.avatar_url);
    $("#username").text(data.login);
    $("#profile-link").html(
      `GitHub: <a href="${data.html_url}" 
      target="_blank" class="text-black text-decoration-none">${data.html_url}</a>`
    );
    if (data.bio) {
      $("#bio").text(`Bio: ${data.bio}`);
    }
    if (data.location) {
      $("#location").text(`Location: ${data.location}`);
    }
    if (data.twitter_username) {
      $("#twitter").html(
        `Twitter: <a href="https://twitter.com/${data.twitter_username}" 
        target="_blank" class="text-black text-decoration-none">https://twitter.com/${data.twitter_username}</a>`
      );
    }
  })
  .catch((error) => console.error("Error fetching user data:", error));

// Display repositories with skeletal loader
function displayReposWithLoader() {
  const reposContainer = $("#repos-container");
  const reposPerPage = 10;

  // Clear existing content
  reposContainer.empty();

  // Display skeletal loader for each repo container
  for (let i = 0; i < reposPerPage; i++) {
    const skeletonLoader = `<div class="card repo-card skeleton-loader"></div>`;
    reposContainer.append(skeletonLoader);
  }
}

// Fetch user repositories using the fetch API with pagination
function fetchAllRepos() {
  let allRepos = [];
  let page = 1;

  function fetchPage() {
    return fetch(`${reposUrl}&page=${page}`)
      .then((response) => response.json())
      .then((repos) => {
        if (repos.length > 0) {
          allRepos = allRepos.concat(repos);
          page++;
          return fetchPage(); // Fetch next page
        } else {
          return allRepos;
        }
      });
  }

  return fetchPage();
}

// Fetch all repositories and then display them
fetchAllRepos()
  .then((allRepos) => {
    const reposPerPage = 10;
    const totalRepos = allRepos.length;
    console.log(totalRepos);
    const totalPages = Math.ceil(totalRepos / reposPerPage);

    // Display the first page of repositories
    displayRepos(allRepos.slice(0, reposPerPage));

    // Render pagination buttons
    renderPagination(totalPages);
  })
  .catch((error) => console.error("Error fetching user repositories:", error));

// Display repositories in the repos-container
function displayRepos(repos) {
  const reposContainer = $("#repos-container");
  reposContainer.empty(); // Clear existing content

  $("#repos-container").empty(); // Clear existing content
  repos.forEach((repo) => {
    const repoCard = `
      <div class="card repo-card">
          <div class="card-body">
              <h3 class="card-title text-primary">${repo.name
                .toUpperCase()
                .split("-")
                .join(" ")}</h3>
              <p class="card-text">${
                repo.description ? repo.description : "No Description"
              }</p>
              <div>
                  ${
                    repo.topics.length > 0
                      ? repo.topics
                          .map((topic) => {
                            if (topic !== null) {
                              return `<span class="badge text-bg-success">${topic}</span>`;
                            } else {
                              return `<span class="badge text-bg-danger">No Topic</span>`;
                            }
                          })
                          .join(" ")
                      : `<span class="badge text-bg-danger">No Topic</span>`
                  }
              </div>
          </div>
      </div>
  `;
    $("#repos-container").append(repoCard);
  });
}

// Render pagination buttons
function renderPagination(totalPages) {
  const paginationContainer = $("#pagination-container");
  paginationContainer.empty(); // Clear existing pagination

  for (let page = 1; page <= totalPages; page++) {
    const listItem = `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${page})">${page}</a></li>`;
    paginationContainer.append(listItem);
  }
}

// Change page and display the corresponding repositories
function changePage(page) {
  fetchAllRepos()
    .then((allRepos) => {
      const reposPerPage = 10;
      const startIndex = (page - 1) * reposPerPage;
      const endIndex = startIndex + reposPerPage;
      const reposToDisplay = allRepos.slice(startIndex, endIndex);

      displayRepos(reposToDisplay);
    })
    .catch((error) =>
      console.error("Error fetching user repositories:", error)
    );
}

// Initial load with skeletal loader
displayReposWithLoader();
