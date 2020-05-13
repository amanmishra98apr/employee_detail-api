var tblHrmEmployeesDetails = require("../models/tbl_hrm_employee_details")
var tblHrmEmployeesMachineDetails = require("../models/tbl_hrm_employee_machine_details")
var tblCommonGrabCities = require("../models/tbl_common_grab_cities")
var tblCommonGrabBranches = require("../models/tbl_common_grab_branches")
var tblBackendUsers = require("../models/tbl_backend_users")
var tblHrmLeavesTypes = require("../models/tbl_hrm_leave_types")
var tblHrmEmployeesLeaveTrack = require("../models/tbl_hrm_employee_leave_track")
var tblHrmCityPublicHolidays = require("../models/tbl_hrm_city_public_holidays")
const sequelize = require("../common/dbconfig").sequelize;
const Sequelize = require("sequelize");
tblHrmEmployeesDetails = tblHrmEmployeesDetails(sequelize, Sequelize)
tblHrmEmployeesMachineDetails = tblHrmEmployeesMachineDetails(sequelize, Sequelize)
tblCommonGrabCities = tblCommonGrabCities(sequelize, Sequelize)
tblCommonGrabBranches = tblCommonGrabBranches(sequelize, Sequelize)
tblBackendUsers = tblBackendUsers(sequelize, Sequelize)
tblHrmLeavesTypes = tblHrmLeavesTypes(sequelize, Sequelize)
tblHrmEmployeesLeaveTrack = tblHrmEmployeesLeaveTrack(sequelize, Sequelize)
tblHrmCityPublicHolidays = tblHrmCityPublicHolidays(sequelize, Sequelize)
const Op = Sequelize.Op;

function convertDate(date) {
  var dateObj = new Date(date);
  var month = '' + (dateObj.getMonth() + 1);
  var day = '' + dateObj.getDate();
  var year = dateObj.getFullYear();
  return year + "-" + month + "-" + day
}

function convertBirthCurrentYear(date) {
  var dateObj = new Date(date);
  var month = '' + (dateObj.getMonth() + 1);
  var day = '' + dateObj.getDate();
  var year = dateObj.getFullYear();
  return new Date().getFullYear() + "-" + month + "-" + day
}


exports.getUserProfile = async (req, res, next) => {
  var output = {
    "data": [],
    "status": "success",
    "message": "everything is ok"
  };
  try {
    var empId = req.body.empId;
  }
  catch (error) {
    console.log(error);
    output['status'] = 'error';
    output['message'] = '"Key Error" : "empId" is not present in the request body';
  }
  try {
    var whereCondition = { id: empId }
    var employeeDetails = getEmployeeDetails(whereCondition);
  }
  catch (error) {
    console.log(error);
    output['status'] = 'error';
    output['message'] = 'unable to get employee details of empId: ' + empId.toString();
  }

  output['data'] = await employeeDetails;
  res.json(output);
}

exports.editUserProfile = async (req, res, next) => {
  var output = {
    "data": [],
    "status": "success",
    "message": "everything is ok"
  };
  try {
    var empId = req.body.emp_id;
    var cityId = req.body.city_search;
    var machineId = req.body.mid;
    var aUid = req.body.did;
    var officialEmail = req.body.official_email;
    var personalEmail = req.body.personal_email;
    var officialContact = req.body.official_contact;
    var personalContact = req.body.personal_contact;
    var grabId = req.body.grabid;
    var employeeWeekOff = req.body.employee_weekoff;
    var usernameInput = req.body.user_nm;
    var firstname = req.body.fname
    var middlelname = req.body.mlname
    var lastname = req.body.lname
    var checkinType = req.body.checkin_type
    var grabid = req.body.grabid
    var branchId = req.body.branchid
    var designationId = req.body.designation_id
    var departmentId = req.body.department_id
    var reportingId = req.body.reporting_id
    var approvedId = req.body.approved_id
    var weekoff = req.body.weekoff
    var dob = req.body.dob
    var doj = req.body.doj
    var expectedDateOfJoining = req.body.exdate_of_permanent
    var updateEmployeeData = {
      official_email: officialEmail,
      official_contact: officialContact,
      personal_email: personalEmail,
      personal_contact: personalContact,
      current_address: req.body.current_address,
      permanent_address: req.body.permanent_address != "" ? req.body.permanent_address : "",
      emergency_contact_details: req.body.emergency_contact_details,
      gender: req.body.gender,
      marital_status: req.body.marital_status != "" ? req.body.marital_status : "0",
      languages_known: req.body.languages_known != "" ? req.body.languages_known.join(",") : "",
      qualification: req.body.qualification,
      hobbies: req.body.hobbies != "" ? req.body.hobbies.join(",") : "",
      food_categroy: req.body.food_categroy != "" ? req.body.food_categroy : "0",
      emp_type: req.body.etype != "" ? req.body.etype : "1",
      modified_time: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      modified_auid: aUid
    };
    var updateMachineData = {
      city_id: cityId,
      machine_emp_id: machineId, //machine id is mid
      machine_no: req.body.machine_id, //machine number is machine id
      modified_time: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      modified_auid: aUid
    };
    // completion of api input variables
  }
  catch (error) {
    console.log(error);
    output['status'] = 'error';
    output['message'] = '"Key Error" : ' + error;
  }
  if (output['status'] == 'sucess') {
    var machineDetails = 0;
    if (machineId != "0") {
      var whereConditionMachine = {
        city_id: cityId,
        machine_emp_id: machineId,
        emp_id: { [Op.not]: empId }
      };
      machineDetails = getEmployeeMachineDetails(whereConditionMachine);
    }
    var whereConditionEmployeeDetails = {
      [Op.and]: {
        id: {
          [Op.not]: empId
        },
        a_uid: {
          [Op.not]: 0
        },
        [Op.or]: {
          a_uid: aUid,
          official_email: officialEmail,
          personal_email: personalEmail,
          official_contact: officialContact,
          personal_contact: personalContact,
          grab_id: grabId
        }
      }
    };
    var employeeCount = await getEmployeeCount(whereConditionEmployeeDetails);
    if (await machineDetails.count == 0 && employeeCount.count === 0 && employeeWeekOff.length <= 3) {
      // skipping employee photos
      if (cityId.length >= 0) {
        var duplicateUserDetails = await checkDuplicateUser(usernameInput, cityId)
        if (duplicateUserDetails.count > 0) {
          output['message'] = "duplicate user"
          output['status'] = 'error'
        }
        else {
          updateEmployeeData[branch_id] = (hrmRoleId == '1' || hrmRoleId == '2') ? duplicateUserDetails.id : employeeCount.row[0].branch_id
        }
      }
      if (output['status'] == 'success') {
        try {
          updateEmployeeData[employee_firstname] = (hrmRoleId == '1' || hrmRoleId == '2') ? firstname : employeeCount.row[0].employee_firstname
          updateEmployeeData[employee_middlename] = (hrmRoleId == '1' || hrmRoleId == '2') ? middlelname : employeeCount.row[0].employee_middlename
          updateEmployeeData[employee_lastname] = (hrmRoleId == '1' || hrmRoleId == '2') ? lastname : employeeCount.row[0].employee_lastname
          updateEmployeeData[checkin_type] = (hrmRoleId == '1' || hrmRoleId == '2') ? checkinType : employeeCount.row[0].checkin_type
          updateEmployeeData[grab_id] = (hrmRoleId == '1' || hrmRoleId == '2') ? grabid : employeeCount.row[0].grab_id
          updateEmployeeData[designation_id] = (hrmRoleId == '1' || hrmRoleId == '2') ? designationId : employeeCount.row[0].designation_id
          updateEmployeeData[department_id] = (hrmRoleId == '1' || hrmRoleId == '2') ? departmentId : employeeCount.row[0].department_id
          updateEmployeeData[reporting_id] = (hrmRoleId == '1' || hrmRoleId == '2') ? reportingId : employeeCount.row[0].reporting_id
          updateEmployeeData[approved_by] = (hrmRoleId == '1' || hrmRoleId == '2') ? approvedId : employeeCount.row[0].approved_by
          updateEmployeeData[employee_weekoff] = (hrmRoleId == '1' || hrmRoleId == '2') ? weekoff : employeeCount.row[0].employee_weekoff
          updateEmployeeData[date_of_birth] = (hrmRoleId == '1' || hrmRoleId == '2') ? dob : employeeCount.row[0].date_of_birth
          updateEmployeeData[date_of_joining] = (hrmRoleId == '1' || hrmRoleId == '2') ? doj : employeeCount.row[0].date_of_joining
          updateEmployeeData[expected_date_of_permanent] = (hrmRoleId == '1' || hrmRoleId == '2') ? expectedDateOfJoining : employeeCount.row[0].expected_date_of_permanent
          updateEmployeeData[city_id] = (hrmRoleId == '1' || hrmRoleId == '2') ? cityId : employeeCount.row[0].city_id
          updateEmployeeData[profile_photo] = (hrmRoleId == '1' || hrmRoleId == '2') ? aUid : employeeCount.row[0].profile_photo
          updateEmployeeData[a_uid] = (hrmRoleId == '1' || hrmRoleId == '2') ? "" : employeeCount.row[0].aUid
        } catch (error) {
          output['status'] = 'error'
          output['message'] = 'unable to insert the data in the database: ' + error;
          console.log(error)
        }
        if (firstname != "" && grabId != "0" && designationId != "0" && departmentId != "0") {
          var udpatedEmployeeDetailsResult = await updateEmployeeLeaveTrack({ id: empId }, updateEmployeeData);
          var udpatedMachineResult = await updateEmployeeMachineDetails({ emp_id: empId }, updateMachineData);
          // skipping google signature for now

        }
      }
    }
  }
  res.json(output);
}

exports.addUserProfile = async (req, res, next) => {
  var output = {
    "data": [],
    "status": "success",
    "message": "everything is ok"
  };
  try {
    try {
      var cityId = req.body.city_id;
      var machineId = req.body.mid;
      var aUid = req.body.did;
      var officialEmail = req.body.official_email;
      var personalEmail = req.body.personal_email;
      var officialContact = req.body.official_contact;
      var personalContact = req.body.personal_contact;
      var grabId = req.body.grabid;
      var employeeWeekOff = req.body.employee_weekoff;
      var usernameInput = req.body.user_nm;
      var insertEmployeeData = {
        employee_firstname: req.body.employee_firstname != "" ? req.body.employee_firstname : "",
        employee_middlename: req.body.employee_middlename != "" ? req.body.employee_middlename : "",
        employee_lastname: req.body.employee_lastname != "" ? req.body.employee_lastname : "",
        grab_id: req.body.grab_id != "" ? req.body.grab_id : "",
        city_id: cityId != "" ? cityId : "",
        a_uid: aUid != "" ? aUid : "0",
        profile_photo: "",
        designation_id: req.body.des_search,
        department_id: req.body.dep_search,
        reporting_id: req.body.reporting_id.join(','),
        approved_by: req.body.approvedby,
        employee_weekoff: employeeWeekOff.join(','),
        official_email: officialEmail,
        official_contact: officialContact,
        personal_email: personalEmail,
        personal_contact: personalContact,
        current_address: req.body.current_address,
        permanent_address: req.body.permanent_address != "" ? req.body.permanent_address : "",
        date_of_birth: req.body.date_of_birth != "" ? convertDate(req.body.date_of_birth) : "0000-00-00",
        date_of_joining: req.body.date_of_joining != "" ? convertDate(req.body.date_of_joining) : "0000-00-00",
        expected_date_of_permanent: req.body.expected_date_of_permanent != "" ? convertDate(req.body.expected_date_of_permanent) : "0000-00-00",
        emergency_contact_details: req.body.emergency_contact_details.join(","),
        checkin_type: req.body.checkin_type,
        geender: req.body.gender,
        marital_status: req.body.marital_status != "" ? req.body.marital_status : "0",
        languages_known: req.body.languages_known != "" ? req.body.languages_known.join(",") : "",
        qualification: req.body.qualification,
        hobbies: req.body.hobbies != "" ? req.body.hobbies.join(",") : "",
        food_categroy: req.body.food_categroy != "" ? req.body.food_categroy : "0",
        emp_type: req.body.etype != "" ? req.body.etype : "1",
        created_time: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        created_auid: aUid,
        status: "3"
      };
      var insertMachineData = {
        city_id: cityId,
        machine_emp_id: machineId, //machine id is mid
        machine_no: req.body.machine_id, //machine number is machine id
        created_auid: aUid,
        created_time: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
      };
    }
    catch (error) {
      console.log(error)
      output['status'] = 'error';
      output['message'] = '"Key Error" : ' + error;
    }
    // completion of api input variables
    if (output.status == 'success') {
      var leaveTypes = getAllLeaveTypes();
      var machineDetails = 0;
      if (cityId != "" && machineId != "") {
        var whereConditionMachine = {
          city_id: cityId,
          machine_emp_id: machineId
        };
        machineDetails = getEmployeeMachineDetails(whereConditionMachine);
        var whereConditionEmployeeDetails = {
          [Op.and]: {
            a_uid: {
              [Op.not]: 0
            },
            [Op.or]: {
              a_uid: aUid,
              official_email: officialEmail,
              personal_email: personalEmail,
              official_contact: officialContact,
              personal_contact: personalContact,
              grab_id: grabId
            }
          }
        };
        var employeeCount = await getEmployeeCount(whereConditionEmployeeDetails);
      }
      else {
        output['status'] = "error"
        output['message'] = "please send proper city id or machine id"
      }
      if (output['status'] == 'success') {
        // now we can proceed further if there is no key error
        if (cityId.length >= 0) {
          if (await machineDetails.count == 0 && employeeCount.count === 0 && employeeWeekOff.length <= 3) {
            // skipping employee photos
            var duplicateUserDetails = await checkDuplicateUser(usernameInput, cityId)
            if (duplicateUserDetails.count > 0) {
              output['message'] = "duplicate user"
              output['status'] = 'error'
            }
            else {
              insertData.branch_id = duplicateUserDetails.id;
              try {
                var insertEmployeeDetailsResult = await tblHrmEmployeesDetails.create(insertEmployeeData);
              } catch (error) {
                output['status'] = 'error';
                output['message'] = 'unable to insert the data in the database: ' + error;
                console.log(error);
              }
              if (output['status'] == 'success' && insertEmployeeDetailsResult.length > 0) {
                insertMachineData.emp_id = insertEmployeeDetailsResult.id;
                var machineInsertResult = insertEmployeeMachineDetails(insertMachineData);
                var insertLeaveData = []
                for (var i of await leaveTypes) {
                  insertLeaveData.push({
                    emp_id: insertEmployeeDetailsResult.id,
                    city: insertEmployeeData.city_id,
                    leave_types: i,
                    created_time: insertEmployeeData.created_time,
                    leave_year: new Date().getFullYear()
                  })
                }
                var insertLeaveDataResult = bulkCreateEmployeeLeaveTrack(insertEmployeeData)
                // skipping google for now
                var opleavesArr = ['3', '13', '17'];
                if (opleavesArr.includes(insertEmployeeData.department_id)) {
                  var whereLeaveTrack = {
                    emp_id: insertEmployeeDetailsResult.id,
                    leave_type: 5
                  };
                  var updateLeaveTrack = {
                    total_leaves: 4,
                    eligible_leaves: 4,
                    temp_pending_leaves: 4,
                    main_pending_leaves: 4
                  };
                  var updateOperationLeave = updateEmployeeLeaveTrack(whereLeaveTrack, updateLeaveTrack)
                  if (convertBirthCurrentYear(insertEmployeeData.date_of_birth)) {
                    var whereLeaveTrack = {
                      emp_id: insertEmployeeDetailsResult.id,
                      leave_type: 6
                    };
                    var updateLeaveTrack = {
                      total_leaves: 1,
                      eligible_leaves: 1,
                      temp_pending_leaves: 1,
                      main_pending_leaves: 1
                    };
                    var updateBirthDayLeave = updateEmployeeLeaveTrack(whereLeaveTrack, updateLeaveTrack)
                  }
                  // $this->_report->insertHrmLog($hrm_id = $res, $action = "add", $details = json_encode($insertdata), $response = $res, $updated_auid = $this->_seesion->a_uid, $updated_hrmid = 0);
                  // // if ($res > 0) {
                  // $this->saveEmployee($formData)
                  var whereConditionPublicHolidays = {
                    [Op.and]: {
                      city_id: cityId,
                      date: {
                        [Op.gt]: new Date().getFullYear() + "-" + new Date().getMonth() + 1 + "-" + new Date().getDate(),
                        [Op.lte]: new Date().getFullYear() + "-12-31"
                      }
                    }
                  }
                  var countPublicHolidays = await getPublicHolidaysCount(whereConditionPublicHolidays)
                  countPublicHolidays = countPublicHolidays.count
                  whereLeaveTrack = {
                    emp_id: insertEmployeeDetailsResult.id,
                    leave_type: 3
                  }
                  updateLeaveTrack = {
                    total_leaves: countPublicHolidays,
                    eligible_leaves: countPublicHolidays,
                    temp_pending_leaves: countPublicHolidays,
                    main_pending_leaves: countPublicHolidays
                  }
                  var updatePublicHolidayLeave = updateEmployeeLeaveTrack(whereLeaveTrack, updateLeaveTrack)
                  await insertLeaveDataResult;
                  await updateOperationLeave;
                  await updateBirthDayLeave;
                  await updatePublicHolidayLeave;
                  output['message'] = 'inserted'
                }
              }
              else {
                output['status'] = 'error';
                output['message'] = "unable to insert data into the database"
              }
            }
          }
          else {
            if (machineId == machineDetails.rows[0]['machine_emp_id']) {
              output['status'] = 'error';
              output['message'] = 'Machine id Already Available';
            }
            if (aUid == employeeCount.rows[0]['a_uid']) {
              output['status'] = 'error';
              output['message'] = 'Dashboard id Already Available';
            }
            if (officialEmail == employeeCount.rows[0]['official_email']) {
              output['status'] = 'error';
              output['message'] = 'Official email id Already Available';
            }
            if (personalEmail == employeeCount.rows[0]['personal_email']) {
              output['status'] = 'error';
              output['message'] = 'Personal email id Already Available';
            }
            if (officialContact == employeeCount.rows[0]['official_contact']) {
              output['status'] = 'error';
              output['message'] = 'Official Contact Already Available';
            }
            if (personalContact == employeeCount.rows[0]['personal_contact']) {
              output['status'] = 'error';
              output['message'] = 'Personal Contact Already Available';
            }
            if (employeeWeekOff.length > 3) {
              output['status'] = 'error';
              output['message'] = "You can take a maximum 3 week off";
            }
            if (grabId == employeeCount.rows[0]['grab_id']) {
              output['status'] = 'error';
              output['message'] = "Grab id already available";
            }
          }
        }
      }
    }
  }
  catch (error) {
    console.log(error);
    output['status'] = 'error';
    output['message'] = '"Key Error" : ' + error;
  }
  res.json(output);
}

async function updateEmployeeMachineDetails(whereCondition, data) {
  return await tblHrmEmployeesMachineDetails.findAll({
    whereCondition
  }).on('success', function (machineInformation) {
    if (machineInformation) {
      machineInformation.update(data)
    }
  })
}

async function updateEmployeeLeaveTrack(whereCondition, data) {
  return await tblHrmEmployeesDetails.findAll({
    whereCondition
  }).on('success', function (employeeInformation) {
    if (employeeInformation) {
      employeeInformation.update(data)
    }
  })
}

async function getPublicHolidaysCount(whereCondition) {
  return await tblHrmCityPublicHolidays.findAndCountAll({
    where: whereCondition
  })
}


async function updateEmployeeLeaveTrack(whereCondition, data) {
  return await tblHrmEmployeesLeaveTrack.findAll({
    whereCondition
  }).on('success', function (employeeLeaveTrack) {
    if (employeeLeaveTrack) {
      employeeLeaveTrack.update(data)
    }
  })
}

async function bulkCreateEmployeeLeaveTrack(data) {
  return await tblHrmEmployeesLeaveTrack.bulkCreate(data);
}

async function getAllLeaveTypes() {
  var leaveTypes = await tblHrmLeavesTypes.findAll({
    attributes: ['id'],
    where: {
      active: 1
    },
    raw: true
  })
  var leaveTypesIdArr
  for (var i of leaveTypes) {
    leaveTypesIdArr.push(i.id)
  }
  return leaveTypesIdArr
}

async function getEmployeeDetails(whereCondition) {
  try {
    return await tblHrmEmployeesDetails.findAll({
      where: whereCondition
    });
  }
  catch (error) {
    console.log(error);
    return [];
  }
}

async function getEmployeeCount(whereCondition) {
  try {
    return await tblHrmEmployeesDetails.findAndCountAll({
      where: whereCondition
    });
  }
  catch (error) {
    console.log(error);
    return [];
  }
}

// Todo Discuss with Nidhin on this then will proceed
async function getEmployeeMachineDetails(whereCondition) {
  return await tblHrmEmployeesMachineDetails.findAndCountAll({
    attributes: ['machine_emp_id', 'machine_no'],
    where: whereCondition
  })
}

async function checkDuplicateUser(username_input, city = null) {
  var whereCondition = {
    active: 1
  };
  if (city != null) {
    whereCondition[id] = cityId;
  }
  var branchDetails = await tblCommonGrabCities.findAll({
    attributes: [branch_id],
    where: whereCondition
  })
  var branchArr = [];
  for (var i of branchDetails) {
    branchArr.push(i['branch_id']);
  }
  var branchQueryResult = await tblCommonGrabBranches.findAll({
    attributes: [id, branch_name],
    where: {
      active: 1,
      id: branchArr
    }
  })
  var output = {}
  if (branchQueryResult.length > 0) {
    id = branchQueryResult[0]['id']
    output['id'] = id
    // for (var row of branchQueryResult) {
    //   output[row['id']] = row['branch_name'].charAt(0).toUpperCase() + row['branch_name'].toLowerCase().slice(1)
    // }
    var outputResult = await tblBackendUsers.findAndCountAll({
      attributes: ['a_uid'],
      where: {
        username: username_input
      }
    })
    output['count'] = outputResult.count
  }
  return output
}

async function insertEmployeeMachineDetails(data) {
  return await tblHrmEmployeesMachineDetails.create(data)
}
