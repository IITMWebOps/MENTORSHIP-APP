import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {

    const navigate = useNavigate();

    const user =
        JSON.parse(localStorage.getItem("user"));

    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/");

    };

    return (

        <div className="bg-white h-16 shadow px-6 flex justify-between items-center">

            <div>

                <h1 className="font-bold text-xl">

                    Saathi Mentorship Portal

                </h1>

            </div>

            <div className="flex items-center gap-5">

                <div className="text-right">

                    <p className="font-semibold">

                        {user?.name}

                    </p>

                    <p className="text-sm text-gray-500">

                        {user?.role}

                    </p>

                </div>

                <button

                    onClick={logout}

                    className="text-red-600 hover:text-red-700"

                >

                    <LogOut />

                </button>

            </div>

        </div>

    );

}