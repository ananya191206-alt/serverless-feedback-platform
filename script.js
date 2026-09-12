const form = document.getElementById("feedbackForm");

const API_URL = "https://oiio4mbmw1.execute-api.eu-north-1.amazonaws.com/prod/feedback";


// ===============================
// POST - Submit Feedback
// ===============================

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const category = document.getElementById("category").value;
    const rating = document.getElementById("rating").value;
    const message = document.getElementById("message").value;

    const data = {
        name: name,
        email: "student@gmail.com",
        category: category,
        rating: Number(rating),
        message: message
    };

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {

            alert("Feedback submitted successfully!");
            form.reset();
            loadFeedback();

        } else {

            alert("Error submitting feedback");
            console.log(result);

        }

    } catch (error) {

        console.error(error);
        alert("Unable to connect to server");

    }

});


// ===============================
// GET - Load Feedback Records
// ===============================

async function loadFeedback() {

    const feedbackList = document.getElementById("feedbackList");

    feedbackList.innerHTML = "Loading feedback...";

    try {

        const response = await fetch(API_URL);
        const feedbacks = await response.json();

        feedbackList.innerHTML = "";

        if (feedbacks.length === 0) {

            feedbackList.innerHTML = "<p>No feedback available.</p>";
            return;

        }

        feedbacks.forEach(function(feedback) {

            const card = document.createElement("div");

            card.innerHTML = `
                <hr>
                <h3>${feedback.name}</h3>
                <p><strong>Category:</strong> ${feedback.category}</p>
                <p><strong>Rating:</strong> ${feedback.rating}/5</p>
                <p><strong>Message:</strong> ${feedback.message}</p>
                <p><strong>Status:</strong> ${feedback.status}</p>
                <p><strong>Created:</strong> ${feedback.createdAt}</p>

                <button onclick="updateFeedback('${feedback.feedbackId}')">
                    Update
                </button>

                <button onclick="deleteFeedback('${feedback.feedbackId}')">
                    Delete
                </button>
            `;

            feedbackList.appendChild(card);

        });

    } catch (error) {

        console.error(error);

        feedbackList.innerHTML =
            "<p>Unable to load feedback records.</p>";

    }
}


// ===============================
// PUT - Update Feedback
// ===============================

async function updateFeedback(feedbackId) {

    const message = prompt("Enter new feedback message:");

    if (message === null) {
        return;
    }

    const rating = prompt("Enter new rating (1-5):");

    if (rating === null) {
        return;
    }

    const status = prompt("Enter status (New/Reviewed):");

    if (status === null) {
        return;
    }

    const data = {
        feedbackId: feedbackId,
        message: message,
        rating: Number(rating),
        status: status
    };

    try {

        const response = await fetch(API_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {

            alert("Feedback updated successfully!");

            loadFeedback();

        } else {

            alert("Error updating feedback");
            console.log(result);

        }

    } catch (error) {

        console.error(error);
        alert("Unable to update feedback");

    }
}


// ===============================
// DELETE - Delete Feedback
// ===============================

async function deleteFeedback(feedbackId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this feedback?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(API_URL, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                feedbackId: feedbackId
            })
        });

        const result = await response.json();

        if (response.ok) {

            alert("Feedback deleted successfully!");

            loadFeedback();

        } else {

            alert("Error deleting feedback");
            console.log(result);

        }

    } catch (error) {

        console.error(error);
        alert("Unable to delete feedback");

    }
}


// ===============================
// Load records when page opens
// ===============================

loadFeedback();