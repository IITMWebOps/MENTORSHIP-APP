import {
    LayoutDashboard,
    Users,
    ClipboardList,
    MessageSquare,
    Shield,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function Sidebar() {

    const user =
        JSON.parse(localStorage.getItem("user"));

    const role = user?.role;

    const links = {

        admin: [

            {
                name: "Dashboard",
                path: "/admin-dashboard",
                icon: <LayoutDashboard size={18} />,
            },

            {
                name: "Upload Users",
                path: "/upload-users",
                icon: <Users size={18} />,
            },

        ],

        coordinator: [

            {

                name: "Dashboard",

                path: "/coordinator-dashboard",

                icon: <LayoutDashboard size={18} />,

            },

        ],

        super_coordinator: [

            {

                name: "Dashboard",

                path: "/coordinator-dashboard",

                icon: <LayoutDashboard size={18} />,

            },

        ],

        mentor: [

            {

                name: "Dashboard",

                path: "/mentor-dashboard",

                icon: <LayoutDashboard size={18} />,

            },

            {

                name: "Interactions",

                path: "/mentor-dashboard",

                icon: <ClipboardList size={18} />,

            },

        ],

        mentee: [

            {

                name: "Dashboard",

                path: "/mentee-dashboard",

                icon: <LayoutDashboard size={18} />,

            },

            {

                name: "Feedback",

                path: "/mentee-dashboard",

                icon: <MessageSquare size={18} />,

            },

        ],

    };

    return (

        <div className="w-64 bg-indigo-900 text-white">

            <div className="h-16 flex items-center justify-center font-bold text-2xl border-b border-indigo-700">

                SAATHI

            </div>

            <div className="mt-5">

                {links[role]?.map((item) => (

                    <Link

                        key={item.name}

                        to={item.path}

                        className="flex items-center gap-3 px-6 py-3 hover:bg-indigo-700"

                    >

                        {item.icon}

                        {item.name}

                    </Link>

                ))}

            </div>

        </div>

    );

}