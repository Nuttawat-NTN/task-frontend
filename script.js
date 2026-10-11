let tasks =[];
console.table(tasks);

let incompleteTasks = tasks.filter(task => task.completed == false);
console.table(incompleteTasks);

const displayTasks = () => {
    console.log("--- รายการทั้งหมด ---");
    tasks.forEach(task => {
        // ใช้ตัวแปร status เก็บเครื่องหมาย [x] หรือ [ ]
        const status = task.completed ? "[x]" : "[ ]";
        // ใช้ Template Literals (' ') ในการต่อข้อความ
        console.log(`${status} ID: ${task.id} - ${task.title} (ความสำคัญ: ${task.priority})`);
    });
};
displayTasks();

const getTaskByID = (id) => {
    return tasks.find(task => task.id === id);
};
console.log("ค้นหางานด้วย ID 2:", getTaskByID(2));

const getUrgentTasks = () => {
    return tasks.filter(task => !task.completed && task.priority == "high");
};
console.log("งานด่วนที่ยังไม่เสร็จ: ");
console.table(getUrgentTasks());

const titles = tasks.map(task => task.title);
console.log(titles);

const addTask = async (title, priority) => {
    try {
        await fetch('https://cpe-task-api-6n5z.onrender.com/tasks/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // ต้องบอกเซิร์ฟเวอร์ว่าส่ง JSON ไป
            },
            body: JSON.stringify({ title: title, priority: priority }) // แพ็คของลงกล่อง
        });

        // เมื่อเพิ่มที่ Backend เสร็จ สั่งดึงข้อมูลล่าสุดมาวาดใหม่
        fetchTasks();
    } catch (error) {
        console.error("เพิ่มงานไม่สำเร็จ:", error);
    }
};

const toggleTaskStatus = async (id) => {
    try {
        await fetch(`https://cpe-task-api-6n5z.onrender.com/tasks/${id}`, {
            method: 'PUT'
        });
        fetchTasks(); // ดึงข้อมูลใหม่
    } catch (error) {
        console.error("เปลี่ยนสถานะไม่สำเร็จ:", error);
    }
};

const deleteTask = async (id) => {
    try {
        await fetch(`https://cpe-task-api-6n5z.onrender.com/tasks/${id}`, {
            method: 'DELETE'
        });
        fetchTasks(); // ดึงข้อมูลใหม่
    } catch (error) {
        console.error("ลบงานไม่สำเร็จ:", error);
    }
};

// LAB5
// 1. ใช้ querySelector ขึ้นไปที่กล่อง HTML ที่เราต้องจัดการ
const taskListElement = document.querySelector("#taskList");
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const priorityInput = document.querySelector("#priorityInput");

const renderTasks = () => {
    // ถ้าไม่มีงานเลย ให้แสดงข้อความแจ้งเตือน
    if (tasks.length === 0) {
        taskListElement.innerHTML = "<p> เยี่ยมมาก!!! ไม่มีงานค้างเลย</p>";
        return;
    }

    const htmlString = tasks.map(task => {
        const textStyle = task.completed ? "text-decoration: line-through; color: gray;" : "";
        return `
            <div class="task-card">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <!-- ฝัง ID ของงานไว้ที่ปุ่ม เพื่อให้รู้ว่ากดที่งานไหน -->
                    <input type="checkbox" onchange="handleToggle('${task.id}')" ${task.completed ? 'checked' : ''}>
                    <span style="${textStyle}">${task.title} <small>(${task.priority})</small>
                    </span>
                </div>
                <button onclick="handleDelete('${task.id}')" style="color: red; cursor: pointer;">ลบ</button>
            </div>
        `;
    }).join(""); //รวม Array ของ HTML String ให้เป็น String เดียว

    // นำ HTML String ไปยัดใส่หน้าเว็ป
    taskListElement.innerHTML = htmlString;
};

// LAB6
// ใช้คีย์เวิร์ด async หน้าฟังก์ชันเพื่อบอกว่าฟังก์ชันนี้มีการทำงานที่ต้อง "รอ"
const fetchTasks = async () => {
    try {
        // ระหว่างรอข้อมูล ให้แสดงข้อความ Loading บนหน้าจอ
        taskListElement.innerHTML = "<h3 style='text-align: center;'>⏳ กำลังดึงข้อมูลจากเซิร์ฟเวอร์...</h3>";

        // ใช้ fetch ไปขอข้อมูล และใส่ await เพื่อบอกให้ "รอจนกว่าข้อมูลจะมาถึง"
        const response = await fetch('https://cpe-task-api-6n5z.onrender.com/tasks/');

        // แปลงผลลัพธ์ที่ได้ให้กลายเป็นออบเจกต์ JSON
        const data = await response.json();

        // นำข้อมูลที่ได้จากเซิร์ฟเวอร์ มาใส่ในตัวแปร tasks ของเรา
        // เนื่องจาก API ไม่มีฟิลด์ priority เราจึงเติม "low" ให้เป็นค่าเริ่มต้น
        tasks = data.map(item => {
            return {
                id: item._id,
                title: item.title,
                completed: item.completed,
                priority: item.priority || "low" // กำหนดค่าเริ่มต้นเอง
            };
        });

        // เมื่อข้อมูลพร้อมแล้ว สั่งให้วาดหน้าจอใหม่
        renderTasks();

    } catch (error) {
        // ถ้าเน็ตหลุด หรือ URL ผิด จะวิ่งเข้ามาที่นี่
        console.error("เกิดข้อผิดพลาด:", error);
        taskListElement.innerHTML = "<h3 style='text-align: center; color: red;'>❌ ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่</h3>";
    }
};

fetchTasks(); // เรียกใช้ฟังก์ชันดึงข้อมูลจากเซิร์ฟเวอร์

// Listen เมื่อมีการกด Submit ฟอร์ม
taskForm.addEventListener('submit', (event) => {
    // ป้องกันไม่ให้เบราว์เซอร์รีเฟรชหน้าเว็บ (พฤติกรรมดั้งเดิมของฟอร์ม)
    event.preventDefault();

    // ดึงข้อความจากช่อง Input
    const newTitle = taskInput.value;
    const newPriority = priorityInput.value;

    // 1. เรียกใช้ฟังก์ชัน Business Logic (จาก Lab 3)
    addTask(newTitle, newPriority);


    // 3. ล้างค่าในช่องกรอกข้อมูลให้ว่างเปล่า
    taskInput.value = '';
});

// ฟังก์ชันรับคำสั่งลบ
const handleDelete = (id) => {
    // เพื่อความปลอดภัย ควรถามยืนยันก่อนลบ
    if (confirm("คุณแน่ใจหรือไม่ที่จะลบงานนี้?")) {
        deleteTask(id);  // เรียก Logic ลบข้อมูล (Lab 3)
    }
};

// ฟังก์ชันรับคำสั่งเปลี่ยนสถานะ (ติ๊กถูก)
const handleToggle = (id) => {
    toggleTaskStatus(id); // เรียก Logic สลับสถานะ (Lab 3)
};
