const cl = console.log;

const studentForm = document.getElementById('studentForm');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const contact = document.getElementById('contact');

const addStudentBtn = document.getElementById('addStudentBtn');
const updateStudentBtn = document.getElementById('updateStudentBtn');
const studentContainer = document.getElementById('studentContainer');
const loader = document.getElementById('loader');

let BASE_URL = "https://crud-27f49-default-rtdb.firebaseio.com";
let POST_URL = `${BASE_URL}/students.json`;  // change to 'students' node

const snackBar = (msg, icon) => {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2000
    });
};

const objToArr = (obj) => {
    let arr = [];
    for (let key in obj) {
        obj[key].id = key;
        arr.unshift(obj[key]);
    }
    return arr;
};

const renderStudents = (arr) => {
    let result = ``;
    arr.forEach((student,i) => {
        result += `
        <tr id="${student.id}">
                    <td>${i+1}</td>
                    <td>${student.firstName}</td>
                    <td>${student.lastName}</td>
                    <td>${student.email}</td>
                    <td>${student.contact}</td>
                    <td>
                        <button onClick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button>
                       </td><td> <button onClick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                    </td>
                </tr>`;
    });
    studentContainer.innerHTML = result;
};

const makeApiCall = (method, url, body) => {
    loader.classList.remove('d-none');
    let msg = body ? JSON.stringify(body) : null;

    return fetch(url, {
        method: method,
        body: msg,
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .catch(cl)
    .finally(() => {
        loader.classList.add('d-none');
    });
};

// Initial fetch
makeApiCall('GET', POST_URL)
    .then(res => {
        if (res) {
            let students = objToArr(res);
            renderStudents(students);
        }
    });


const reIndexRows = () => {
    const rows = studentContainer.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.children[0].innerText = index + 1;
    });
};

// Add student
const onSubmitStudent = (e) => {
    e.preventDefault();

    let student = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        contact: contact.value
    };

    makeApiCall('POST', POST_URL, student)
        .then(res => {
            studentForm.reset();
            student.id = res.name;

            let row = document.createElement('tr');
            row.setAttribute('id', student.id);
            row.innerHTML = `
                <td></td> 
                <td>${student.firstName}</td>
                <td>${student.lastName}</td>
                <td>${student.email}</td>
                <td>${student.contact}</td>
                <td>
                    <button onClick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button>
                </td>
                <td>
                    <button onClick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                </td>
            `;
            studentContainer.prepend(row);

            reIndexRows(); // Recalculate correct serial numbers
            snackBar(`Student "${student.firstName}" added!`, "success");
        });
};

// Edit student
const onEdit = (btn) => {
    let id = btn.closest("tr").id;
    localStorage.setItem("editStudentId", id);
    let url = `${BASE_URL}/students/${id}.json`;

    makeApiCall("GET", url)
        .then(student => {
            firstName.value = student.firstName;
            lastName.value = student.lastName;
            email.value = student.email;
            contact.value = student.contact;

            addStudentBtn.classList.add('d-none');
            updateStudentBtn.classList.remove('d-none');
        });
};

// Update student
const onUpdateStudent = () => {
    let id = localStorage.getItem("editStudentId");
    let url = `${BASE_URL}/students/${id}.json`;

    let updatedStudent = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        contact: contact.value,
        id: id
    };

    makeApiCall("PATCH", url, updatedStudent)
        .then(res => {
            let row = document.getElementById(id);
            let cells = row.getElementsByTagName("td");

            cells[1].innerText = res.firstName;
            cells[2].innerText = res.lastName;
            cells[3].innerText = res.email;
            cells[4].innerText = res.contact;

            studentForm.reset();
            addStudentBtn.classList.remove('d-none');
            updateStudentBtn.classList.add('d-none');
            snackBar(`Student "${res.firstName}" updated!`, "success");
        });
};

// Remove student
const onRemove = (btn) => {
    Swal.fire({
        title: "Delete this student?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
    }).then(result => {
        if (result.isConfirmed) {
            let row = btn.closest("tr");
            let id = row.id;
            let url = `${BASE_URL}/students/${id}.json`;

            makeApiCall("DELETE", url)
                .then(() => {
                    row.remove();
                    snackBar("Student removed successfully", "success");

                    //  Re-index the serial numbers
                  reIndexRows()
                });
        }
    });
};


// Event Listeners
studentForm.addEventListener("submit", onSubmitStudent);
updateStudentBtn.addEventListener("click", onUpdateStudent);
