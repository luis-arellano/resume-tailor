import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';


// New modern template based on the second image
export default function ModernTemplate({ 
    resumeData, 
    refs,
    createEditableField,
    handleDelete,
    addItem,
  }) {
    return (
      <div className="a4-size">
        {/* Header with two columns */}
        <div className="grid grid-cols-3 gap-4 p-8 bg-zinc-200">
          {/* Left column */}
          <div className="col-span-2">
            {createEditableField('ContactInformation.Name', 'No Name Provided', 'h1', 'text-3xl font-bold mb-1')}
            {createEditableField('ContactInformation.Position', '', 'p', 'text-lg text-gray-600')}
          </div>
          
          {/* Right column */}
          <div className="text-right">
            {createEditableField('ContactInformation.Email', '', 'p', 'text-sm')}
            {createEditableField('ContactInformation.Phone', '', 'p', 'text-sm')}
            {createEditableField('ContactInformation.Location', '', 'p', 'text-sm')}
          </div>
        </div>
  
        {/* Main content grid */}
        <div className="grid grid-cols-3 gap-4">
        
          {/* Left sidebar */}
          <div className="space-y-2 bg-zinc-50 p-2">


        {/* Education Section */}
        {resumeData.Education && resumeData.Education.length > 0 && (
            <section>
            <h2 className="font-bold mb-4">Education</h2>
            {resumeData.Education.map((edu, index) => (
                <div key={index} className="mb-4 ">
                <div className="flex justify-between items-baseline">
                    <div className="flex-1 my-2">
                    {createEditableField(`Education[${index}].School`, '', 'h3', 'font-semibold text-sm')}
                    </div>
                    <button
                    onClick={() => handleDelete('Education', index)}
                    className="ml-2 opacity-0 group-hover:opacity-100"
                    >
                    <FaRegTrashAlt className="w-3 h-3" />
                    </button>
                </div>
                <div className="text-xs text-gray-600">
                    {createEditableField(`Education[${index}].Date`, '')}
                </div>
                {createEditableField(`Education[${index}].Degree`, '', 'p', 'text-sm')}
                </div>
            ))}
            </section>
            )}

          {/* Skills Section */}
          {resumeData.Skills && resumeData.Skills.length > 0 && (
            <>
              <h2 className="font-bold mb-2">Core Skills</h2>
              <p className="text-xs">
                {resumeData.Skills.map((skill, index) => (
                  <span key={index}>
                    {createEditableField(`Skills[${index}]`, '', 'span')}
                    {index < resumeData.Skills.length - 1 ? ', ' : ''}
                  </span>
                ))}
                <button
                  onClick={() => addItem('Skills')}
                  className="no-print xs-text mb-0 hover:text-blue-500 transition-colors duration-200 flex items-center opacity-20 hover:opacity-100"
                >
                  <span className="no-print inline-flex items-center justify-center w-3 h-3 mr-2 border border-blue-500 rounded-full">
                    <FaPlus className="w-2 h-2" />
                  </span>
                  Add Skill
                </button>
              </p>
            </>
          )}


          {/* Other Information Section */}
          {resumeData.OtherInformation && resumeData.OtherInformation.length > 0 && (
            <section>
              <h2 className="font-bold mb-2">Other Information</h2>
              <div className="flex flex-wrap gap-2">
                {resumeData.OtherInformation?.map((info, index) => (
                  <div key={index} className="group inline-flex items-center">
                    {createEditableField(`OtherInformation[${index}]`, '', 'span', 'text-sm')}
                    {index < resumeData.OtherInformation?.length - 1 && <span className="mx-1">,</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

         {/* Languages Section */}
         {resumeData.Languages && resumeData.Languages.length > 0 && (
            <section>
              <h2 className="font-bold mb-2">Languages</h2>
              <ul className="space-y-1">
                {resumeData.Languages?.map((lang, index) => (
                  <li key={index}>
                    {createEditableField(`Languages[${index}]`, '', 'span', 'text-sm')}
                  </li>
                ))}
              </ul>
            </section>
         )}
          </div>
  
          {/* Main content area */}
          <div className="col-span-2 space-y-6 p-2">

            <section>

          {resumeData.Experience && resumeData.Experience.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-2">Work Experience</h2>
              {resumeData.Experience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-baseline">

                    {createEditableField(`Experience[${index}].Title`, '', 'h3', 'text-lg ')}
                    <div className="text-xs text-gray-600">
                      {createEditableField(`Experience[${index}].StartDate`, '', 'span')} - {createEditableField(`Experience[${index}].EndDate`, '', 'span')}
                    </div>
                  </div>
                  {createEditableField(`Experience[${index}].Company`, '', 'h4', 'italic text-base text-gray-800')}

                  {createEditableField(`Experience[${index}].Overview`, '', 'p', 'text-sm mb-1')}
                  {exp.Responsibilities && (
                    <ul className="list-disc pl-5 text-sm">
                      {exp.Responsibilities.map((res, resIndex) => (
                        <li key={resIndex} className="relative mb-2 group">
                          {createEditableField(`Experience[${index}].Responsibilities[${resIndex}]`, '', 'span')}
                          <button
                            onClick={() => handleDelete(`Experience[${index}].Responsibilities`, resIndex)}
                            className="absolute buttom-0 right-0 text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                            <FaRegTrashAlt className="w-3 h-3" />
                            </button>
                        </li>
                      ))}

                      <li className="list-none">

                        <button
                          onClick={() => addItem(`Experience[${index}].Responsibilities`)}
                          className=" no-print xs-text h-0 mb mt-2 hover:text-blue-500 transition-colors duration-200 flex items-center opacity-20 hover:opacity-100"
                        >
                          <span className=" no-print inline-flex items-center justify-center w-3 h-3 mr-2 border border-blue-500 rounded-full">
                            <FaPlus className="w-2 h-2" />
                          </span>
                          Add
                        </button>
                      </li>

                    </ul>
                  )}
                </div>
              ))}
            </>
          )}

            </section>

          </div>
        </div>
      </div>
    );
  }