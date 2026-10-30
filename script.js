const form = document.getElementById("feedbackForm");

const API_URL =
    "https://oiio4mbmw1.execute-api.eu-north-1.amazonaws.com/prod/feedback";


let allFeedbacks = [];


// =====================================
// STAR RATING
// =====================================

const stars = document.querySelectorAll(".star");

stars.forEach(function(star) {

    star.addEventListener("click", function() {

        const rating =
            Number(this.dataset.rating);

        document.getElementById("rating").value =
            rating;


        stars.forEach(function(s) {

            if (
                Number(s.dataset.rating) <= rating
            ) {

                s.classList.add("selected");
                s.textContent = "★";

            } else {

                s.classList.remove("selected");
                s.textContent = "☆";

            }

        });


        document.getElementById("ratingText")
            .textContent =
            rating + " out of 5";

    });

});


// =====================================
// RESET RATING
// =====================================

function resetRating() {

    document.getElementById("rating").value = "";

    stars.forEach(function(star) {

        star.classList.remove("selected");

        star.textContent = "☆";

    });

    document.getElementById("ratingText")
        .textContent = "Select a rating";

}


// =====================================
// TOAST
// =====================================

function showToast(message) {

    const toast =
        document.getElementById("toast");

    document.getElementById("toastMessage")
        .textContent = message;

    toast.classList.add("show");


    setTimeout(function() {

        toast.classList.remove("show");

    }, 2500);

}


// =====================================
// POST
// =====================================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const name =
            document.getElementById("name")
                .value.trim();


        const category =
            document.getElementById("category")
                .value;


        const rating =
            document.getElementById("rating")
                .value;


        const message =
            document.getElementById("message")
                .value.trim();


        if (rating === "") {

            showToast("Please select a rating.");

            return;

        }


        const submitButton =
            document.getElementById("submitBtn");


        submitButton.disabled = true;

        submitButton.textContent =
            "Submitting...";


        const data = {

            name: name,

            email: "student@gmail.com",

            category: category,

            rating: Number(rating),

            message: message

        };


        try {

            const response =
                await fetch(API_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(data)

                });


            const result =
                await response.json();


            if (response.ok) {

                showToast(
                    "Feedback submitted successfully."
                );


                form.reset();

                resetRating();


                // Reload records automatically

                await loadFeedback();

            } else {

                console.log(result);

                showToast(
                    "Error submitting feedback."
                );

            }

        } catch (error) {

            console.error(error);

            showToast(
                "Unable to connect to server."
            );

        }


        submitButton.disabled = false;

        submitButton.textContent =
            "Submit Feedback";

    }
);


// =====================================
// GET
// =====================================

async function loadFeedback() {

    const feedbackList =
        document.getElementById(
            "feedbackList"
        );


    feedbackList.innerHTML = `
        <div class="empty-state">
            <p>Loading feedback...</p>
        </div>
    `;


    try {

        const response =
            await fetch(API_URL);


        const feedbacks =
            await response.json();


        if (!response.ok) {

            throw new Error(
                "Could not load feedback"
            );

        }


        allFeedbacks =
            Array.isArray(feedbacks)
                ? feedbacks
                : [];


        updateAnalytics(
            allFeedbacks
        );


        applyFilters();


    } catch (error) {

        console.error(error);


        feedbackList.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load feedback</h3>
                <p>Please try again later.</p>
            </div>
        `;

    }

}


// =====================================
// DISPLAY FEEDBACK
// =====================================

function displayFeedback(feedbacks) {

    const feedbackList =
        document.getElementById(
            "feedbackList"
        );


    if (feedbacks.length === 0) {

        feedbackList.innerHTML = `
            <div class="empty-state">
                <h3>No feedback found</h3>
                <p>
                    Try another search or submit new feedback.
                </p>
            </div>
        `;

        return;

    }


    feedbackList.innerHTML = "";


    feedbacks.forEach(function(feedback) {

        const card =
            document.createElement("div");


        card.className =
            "feedback-card";


        const rating =
            Number(feedback.rating) || 0;


        let starsHTML = "";


        for (let i = 1; i <= 5; i++) {

            if (i <= rating) {

                starsHTML += "★";

            } else {

                starsHTML += "☆";

            }

        }


        let dateText =
            feedback.createdAt ||
            "Date unavailable";


        if (feedback.createdAt) {

            const date =
                new Date(
                    feedback.createdAt
                );


            if (!isNaN(date.getTime())) {

                dateText =
                    date.toLocaleString();

            }

        }


        card.innerHTML = `

            <div class="feedback-top">

                <div class="feedback-title">
                    ${escapeHTML(
                        feedback.name ||
                        "Anonymous"
                    )}
                </div>

                <div class="feedback-rating">
                    ${starsHTML}
                </div>

            </div>


            <span class="feedback-category">
                ${escapeHTML(
                    feedback.category ||
                    "Other"
                )}
            </span>


            <p class="feedback-message">
                ${escapeHTML(
                    feedback.message ||
                    ""
                )}
            </p>


            <p class="feedback-date">
                Submitted: 
                ${escapeHTML(dateText)}
            </p>


            <p class="feedback-date">
                Status:
                ${escapeHTML(
                    feedback.status ||
                    "New"
                )}
            </p>


            <div class="feedback-actions">

                <button
                    class="edit-btn"
                    onclick="updateFeedback(
                        '${feedback.feedbackId}'
                    )">
                    Edit
                </button>


                <button
                    class="delete-btn"
                    onclick="deleteFeedback(
                        '${feedback.feedbackId}'
                    )">
                    Delete
                </button>

            </div>

        `;


        feedbackList.appendChild(card);

    });

}


// =====================================
// SEARCH
// =====================================

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        applyFilters
    );


// =====================================
// FILTER
// =====================================

document
    .getElementById("filterCategory")
    .addEventListener(
        "change",
        applyFilters
    );


// =====================================
// SORT
// =====================================

document
    .getElementById("sortFeedback")
    .addEventListener(
        "change",
        applyFilters
    );


// =====================================
// SEARCH + FILTER + SORT
// =====================================

function applyFilters() {

    let filtered =
        [...allFeedbacks];


    const search =
        document.getElementById(
            "searchInput"
        ).value
         .toLowerCase()
         .trim();


    const category =
        document.getElementById(
            "filterCategory"
        ).value;


    const sort =
        document.getElementById(
            "sortFeedback"
        ).value;


    // Search

    if (search !== "") {

        filtered =
            filtered.filter(
                function(feedback) {

                    return (

                        String(
                            feedback.name || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            feedback.category || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            feedback.message || ""
                        )
                        .toLowerCase()
                        .includes(search)

                    );

                }
            );

    }


    // Category

    if (category !== "All") {

        filtered =
            filtered.filter(
                function(feedback) {

                    return (
                        feedback.category ===
                        category
                    );

                }
            );

    }


    // Sorting

    if (sort === "highest") {

        filtered.sort(
            function(a, b) {

                return Number(b.rating) -
                       Number(a.rating);

            }
        );

    }


    else if (sort === "lowest") {

        filtered.sort(
            function(a, b) {

                return Number(a.rating) -
                       Number(b.rating);

            }
        );

    }


    else if (sort === "oldest") {

        filtered.sort(
            function(a, b) {

                return new Date(
                    a.createdAt
                ) -
                new Date(
                    b.createdAt
                );

            }
        );

    }


    else {

        filtered.sort(
            function(a, b) {

                return new Date(
                    b.createdAt
                ) -
                new Date(
                    a.createdAt
                );

            }
        );

    }


    displayFeedback(filtered);

}


// =====================================
// UPDATE
// =====================================

async function updateFeedback(
    feedbackId
) {

    const feedback =
        allFeedbacks.find(
            function(item) {

                return (
                    item.feedbackId ===
                    feedbackId
                );

            }
        );


    if (!feedback) {

        showToast(
            "Feedback not found."
        );

        return;

    }


    const message =
        prompt(
            "Enter new feedback message:",
            feedback.message || ""
        );


    if (message === null) {
        return;
    }


    const rating =
        prompt(
            "Enter new rating (1-5):",
            feedback.rating || 5
        );


    if (rating === null) {
        return;
    }


    const ratingNumber =
        Number(rating);


    if (
        ratingNumber < 1 ||
        ratingNumber > 5 ||
        !Number.isInteger(
            ratingNumber
        )
    ) {

        showToast(
            "Rating must be between 1 and 5."
        );

        return;

    }


    const status =
        prompt(
            "Enter status:",
            feedback.status || "New"
        );


    if (status === null) {
        return;
    }


    const data = {

        feedbackId:
            feedbackId,

        message:
            message.trim(),

        rating:
            ratingNumber,

        status:
            status.trim()

    };


    try {

        const response =
            await fetch(API_URL, {

                method: "PUT",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(data)

            });


        const result =
            await response.json();


        if (response.ok) {

            showToast(
                "Feedback updated successfully."
            );

            await loadFeedback();

        } else {

            console.log(result);

            showToast(
                "Error updating feedback."
            );

        }

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to update feedback."
        );

    }

}


// =====================================
// DELETE
// =====================================

async function deleteFeedback(
    feedbackId
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this feedback?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(API_URL, {

                method: "DELETE",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    feedbackId:
                        feedbackId

                })

            });


        const result =
            await response.json();


        if (response.ok) {

            showToast(
                "Feedback deleted successfully."
            );

            await loadFeedback();

        } else {

            console.log(result);

            showToast(
                "Error deleting feedback."
            );

        }

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to delete feedback."
        );

    }

}


// =====================================
// ANALYTICS
// =====================================

function updateAnalytics(
    feedbacks
) {

    const total =
        feedbacks.length;


    document.getElementById(
        "totalFeedback"
    ).textContent =
        total;


    document.getElementById(
        "feedbackCount"
    ).textContent =
        total +
        (total === 1
            ? " response"
            : " responses");


    if (total === 0) {

        document.getElementById(
            "averageRating"
        ).textContent =
            "0.0";


        document.getElementById(
            "categoryCount"
        ).textContent =
            "0";


        resetChart();

        return;

    }


    // Average rating

    let totalRating = 0;


    feedbacks.forEach(
        function(feedback) {

            totalRating +=
                Number(feedback.rating) || 0;

        }
    );


    const average =
        totalRating / total;


    document.getElementById(
        "averageRating"
    ).textContent =
        average.toFixed(1);


    // Categories

    const categories =
        new Set();


    feedbacks.forEach(
        function(feedback) {

            if (feedback.category) {

                categories.add(
                    feedback.category
                );

            }

        }
    );


    document.getElementById(
        "categoryCount"
    ).textContent =
        categories.size;


    // Rating counts

    const counts = {

        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0

    };


    feedbacks.forEach(
        function(feedback) {

            const rating =
                Number(feedback.rating);


            if (
                rating >= 1 &&
                rating <= 5
            ) {

                counts[rating]++;

            }

        }
    );


    for (
        let rating = 1;
        rating <= 5;
        rating++
    ) {

        const percentage =
            (counts[rating] / total) *
            100;


        document.getElementById(
            "bar" + rating
        ).style.width =
            percentage + "%";


        document.getElementById(
            "count" + rating
        ).textContent =
            counts[rating];

    }

}


// =====================================
// RESET CHART
// =====================================

function resetChart() {

    for (
        let rating = 1;
        rating <= 5;
        rating++
    ) {

        document.getElementById(
            "bar" + rating
        ).style.width =
            "0%";


        document.getElementById(
            "count" + rating
        ).textContent =
            "0";

    }

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


// =====================================
// START
// =====================================

loadFeedback();
