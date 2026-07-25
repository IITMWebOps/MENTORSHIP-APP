export default function StatsCard({

    title,

    value,

    color = "bg-indigo-600",

}) {

    return (

        <div className={`${color} rounded-xl shadow-lg text-white p-5`}>

            <p className="text-sm opacity-80">

                {title}

            </p>

            <h2 className="text-3xl font-bold mt-2">

                {value}

            </h2>

        </div>

    );

}