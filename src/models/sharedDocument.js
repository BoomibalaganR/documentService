const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for SharedDocument
const SharedDocumentSchema = new Schema({
//   b2brelationship: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'B2BRelationship' 
//   },
//   relationship: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Relationship' 
//   },
  relationship_id: {
    type: String, 
    required: true
  },
//   docref: { 
//     type: mongoose.Schema.Types.Mixed,
//     refPath: 'relationship_type' // Adjust as per your design
//   },
  relationship_type: { 
    type: String, 
    required: true
  },
  shared_with: { 
    type: String, 
    required: true
  },
  shared_by: { 
    type: String, 
    required: true
  },
  docid: { 
    type: String, 
    required: true
  },
  doctype: { 
    type: String, 
    required: true
  },
  docversion: { 
    type: String, 
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SharedDocument', SharedDocumentSchema)