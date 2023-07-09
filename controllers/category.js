const Category = require("../models/category");

//create tag handler function
exports.createCategory = async(req, res)=>{
    try{
        //fetch data
        const { name , description} = req.body;
        //validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            })
        }
        //create entry in db
        const categoryDetails = await Category.create({
            name:name , 
            description:description
        });
        console.log(categoryDetails);

        return res.status(200).json({
            success:true,
            message:"category created successfully"
        })
    }
    catch(err){
		console.log(err)
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

exports.showAllCategories = async (req, res) => {
	try {
		const allCategorys = await Category.find(
			{},
			{ name: true, description: true }
		);
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//category page details
exports.categoryPageDetails = async(req ,res)=>{
    try{
        const {categoryId} = req.body;

        //get courses for the specified category
        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();

        // Handle the case when the category is not found
		if (!selectedCategory) {
			console.log("Category not found.");
			return res
				.status(404)
				.json({ success: false, message: "Category not found" });
		}


		// Handle the case when there are no courses inside selected category
		if (selectedCategory.courses.length === 0) {
			console.log("No courses found for the selected category.");
			return res.status(404).json({
				success: false,
				message: "No courses found for the selected category.",
			});
		}

        //fetchig the course available or present in selected category
		const selectedCourses = selectedCategory.courses;

        //get courses for other category
        const categoriesExceptSelected = await Category.find({ _id: {$ne:categoryId} }).populate("courses");

        //need to understand from here
        let differentCourses = [];
		
		for (const category of categoriesExceptSelected) {
			differentCourses.push(...category.courses);
		}

		// Get top-selling courses across all categories
		const allCategories = await Category.find().populate("courses");
		const allCourses = allCategories.flatMap((category) => category.courses);
		const mostSellingCourses = allCourses
			.sort((a, b) => b.sold - a.sold)
			.slice(0, 10);

		res.status(200).json({
			selectedCourses: selectedCourses,
			differentCourses: differentCourses,
			mostSellingCourses: mostSellingCourses,
		});
    
    }
    catch(err){
        return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
    }
}